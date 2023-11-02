const express = require("express");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const userAuth = require("../userAuth");
const bodyParser = require("body-parser");

const User = require("../modal/user_modal");
const Admin = require("../modal/admin_modal");

const router = express.Router();

const limiter = rateLimit({
  max: 100,
  windowMs: 1000 * 60 * 30,
  message: "Too many requests from this IP,Please try again in 30 minitus!",
});

const storage = multer({
  limits: {
    fileSize: 5000000,
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

router.use(cookieParser());
router.use("/user", limiter);
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

router.post("/userFiles", userAuth, async (req, res) => {
  try {
    res.status(200).send({ files: req.user.files });
  } catch (err) {
    console.log({ err });
    res.status(404).send(err);
  }
});

router.post(
  "/user/files/:id",
  storage.array("files[]", 5),
  limiter,
  async (req, res) => {
    let userFiles = [
      { filetype: "pdf", fileData: [] },
      { filetype: "image", fileData: [] },
      { filetype: "text", fileData: [] },
    ];
    try {
      await req.files.forEach((file) => {
        if (file.mimetype === "application/pdf") {
          const data = {
            file: Buffer.from(file.buffer).toString("base64"),
            fileName: file.originalname,
          };
          // const data = { file: file.buffer, fileName: file.originalname };
          userFiles[0].fileData.push(data);
        } else if (file.mimetype.startsWith("image")) {
          const data = { file: file.buffer, fileName: file.originalname };
          userFiles[1].fileData.push(data);
        } else if (file.mimetype.startsWith("text")) {
          const data = { file: file.buffer, fileName: file.originalname };
          userFiles[2].fileData.push(data);
        }
      });
      userFiles = userFiles.filter((userFile) => {
        if (userFile.fileData.length !== 0) {
          return userFile;
        }
      });
      await Admin.findOneAndUpdate(
        { qr_id: req.params.id },
        {
          $inc: {
            totalUsers: 1,
            totalFiles: req.files.length,
          },
        }
      );
      const user = new User({
        name: req.body.name,
        shop_id: req.params.id,
        files: userFiles,
      });
      const token = await user.getusertoken();
      await user.save();
      const cookieOptions = {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        httpOnly: true,
      };
      res.cookie("userToken", token, cookieOptions);
      res.status(200).send({
        success: true,
        name: user.name,
      });
    } catch (err) {
      console.log({ err });
      res.status(404).send(err);
    }
  }
);

router.delete("/deleteUser/:id", async (req, res) => {
  try {
    const data = await User.findOneAndDelete({ _id: req.params.id });
    if (!data || data.length === 0) {
      throw { message: "No User Found.", status: 502 };
    }
    res.status(200).send({ success: true });
  } catch (err) {
    console.log({ err });
    res.status(err.status || 404).send(err);
  }
});

router.post("/user/getPlaces", async (req, res) => {
  try {
    const [lng, lat] = req.body.loc;
    // const [lng, lat] = [-122.46149, 37.77192];
    const radius = +req.body.radius;
    console.log(radius, req.body.loc);
    const data = await Admin.find({
      location: {
        $near: {
          $geometry: { type: "point", coordinates: [lng, lat] },
          // $geometry: { type: "point", coordinates: [-122.46149, 37.77192] },
          $maxDistance: +radius,
        },
      },
    }).select({ location: 1, shopName: 1, email: 1 });
    console.log(data);
    res.status(200).send(data);
  } catch (err) {
    console.log(err);
    res.status(404).send(err);
  }
});

router.delete("/deleteUser", userAuth, async (req, res) => {
  try {
    const data = await User.findOneAndDelete({ _id: req.user.id });
    if (!data || data.length === 0) {
      throw { message: "No User Found.", status: 502 };
    }
    res.status(200).send({ success: true });
  } catch (err) {
    console.log({ err });
    res.status(err.status || 404).send(err);
  }
});

module.exports = router;
