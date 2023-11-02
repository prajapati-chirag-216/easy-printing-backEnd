const express = require("express");
const crypto = require("crypto");
const bodyParser = require("body-parser");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const sharp = require("sharp");
const auth = require("../auth");
const Admin = require("../modal/admin_modal");
const {
  sendWelcomeEmail,
  sendCancelationEmail,
  sendResetPasswordEmail,
  sendOtp,
} = require("../collection/email");
const cookieParser = require("cookie-parser");

const router = express.Router();
router.use(cookieParser());

const limiter = rateLimit({
  max: 100,
  windowMs: 1000 * 60 * 30,
  message: "Too many requests from this IP,Please try again in 30 minitus!",
});
router.use("/admin", limiter);

router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
const storage = multer({
  limits: {
    fileSize: 5000000,
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

router.post("/myQr", auth, (req, res) => {
  try {
    res
      .status(200)
      .send({ qr_id: req.admin.qr_id, shopName: req.admin.shopName });
  } catch (err) {
    res.status(err.status || 404).send(err);
  }
});

router.post("/showFiles", auth, async (req, res) => {
  try {
    let ack = false;
    await req.admin.populate({
      path: "pdfs",
      select: { name: 1, files: 1, shop_id: 0, _id: 1 },
      options: {
        limit: 4,
        skip: 3 * req.query.skip,
        sort: {
          createdAt: 1,
        },
      },
    });
    if (req.admin.pdfs.length === 4) {
      ack = true;
    }
    const data = req.admin.pdfs.slice(0, 3);
    res.status(200).send({
      buffer_data: data,
      len: req.admin.pdfs.length,
      ack,
    });
  } catch (err) {
    res.status(404).send(err);
  }
});

router.post("/new-admin", storage.single("image"), async (req, res) => {
  try {
    let adminData;
    if (req.file) {
      const buffer = await sharp(req.file.buffer)
        .resize(200, 200)
        .toFormat("png")
        .png({ quality: 90 })
        .toBuffer();
      adminData = {
        ...req.body,
        profilePhoto: buffer,
      };
    } else {
      adminData = { ...req.body };
    }
    const data = new Admin(adminData);
    const token = data.getauthtoken();

    // sendWelcomeEmail(req.body.shopName, req.body.email);
    data.genrateQrId();
    await data.save();

    const cookieOptions = {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      httpOnly: true,
    };
    res.cookie("token", token, cookieOptions);
    res.status(200).send({
      success: true,
      authToken: token,
    });
  } catch (err) {
    console.log({ err });
    res.status(502).send(err);
  }
});

router.post("/admin/signin", async (req, res) => {
  try {
    const data = await Admin.findbyCredentials(
      req.body.email,
      req.body.password
    );
    const token = await data.getauthtoken();
    await data.save();
    const cookieOptions = {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      httpOnly: true,
    };
    res.cookie("token", token, cookieOptions);
    res.status(200).send({
      success: true,
      authToken: token,
    });
  } catch (err) {
    res.status(err.status || 404).send(err);
  }
});

router.post("/admin/logout", auth, async (req, res) => {
  try {
    // sendCancelationEmail(req.admin.shopName, req.admin.email);
    res.clearCookie("token");
    res.status(200).send({ success: true });
  } catch (err) {
    res.status(404).send(err);
  }
});

router.post("/admin/forgotPassword", async (req, res) => {
  try {
    const data = await Admin.findOne({ email: req.body.email });
    if (!data || data.length === 0) {
      throw { message: "No account exist with this E-mail Id", status: 502 };
    }
    const resettoken = data.createresettoken();
    await data.save({ validateBeforeSave: false });
    // sendResetPasswordEmail(
    //   data.shopName,
    //   data.email,
    //   `${req.protocol}://localhost:3000/admin/resetPassword/${resettoken}`
    // );

    res.status(200).send({ success: true });
  } catch (err) {
    res.status(err.status || 404).send(err);
  }
});

router.post("/admin/resetPassword/:tokenId", async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.tokenId)
    .digest("hex");
  try {
    const data = await Admin.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!data || data.length === 0) {
      throw { message: "Session Time out! Please try again.", status: 502 };
    }
    data.password = req.body.password;
    data.passwordResetToken = undefined;
    data.passwordResetExpires = undefined;
    await data.save();
    return res.status(200).send({ status: true });
  } catch (err) {
    res.status(err.status || 404).send(err);
  }
});

router.post("/admin/accountInfo", auth, async (req, res) => {
  try {
    const profilePhoto = Buffer.from(req.admin.profilePhoto, "binary").toString(
      "base64"
    );
    res.status(200).send({
      email: req.admin.email,
      shopName: req.admin.shopName,
      totalUsers: req.admin.totalUsers,
      totalFiles: req.admin.totalFiles,
      profilePhoto: profilePhoto,
    });
  } catch (err) {
    res.status(err.status || 404).send(err);
  }
});
router.post(
  "/admin/updateImage",
  auth,
  storage.single("image"),
  async (req, res) => {
    try {
      const buffer = await sharp(req.file.buffer)
        .resize(200, 200)
        .toFormat("png")
        .png({ quality: 90 })
        .toBuffer();
      req.admin.profilePhoto = buffer;
      req.admin.save();
      res.status(200).send({
        success: true,
      });
    } catch (err) {
      res.status(err.status || 404).send(err);
    }
  }
);

module.exports = router;
