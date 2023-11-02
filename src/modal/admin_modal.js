const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const profilePhoto = fs.readFileSync(
  path.join(__dirname, "../../assets/profilePhoto.png")
);

const adminSchema = mongoose.Schema({
  shopName: {
    type: String,
    required: true,
  },
  qr_id: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    trim: true,
    unique: [true, "enter valide email please.........."],
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("enter valide email .. ");
      }
    },
    required: true,
  },
  password: {
    type: String,
    trim: true,
    minlength: 8,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error({ invalid: true });
      }
    },
    required: true,
  },
  profilePhoto: {
    type: Buffer,
    default: profilePhoto,
  },
  totalUsers: {
    type: Number,
    default: 0,
  },
  monthlyUsers: {
    type: Number,
    default: 0,
  },
  totalFiles: {
    type: Number,
    default: 0,
  },
  location: {
    type: { type: String },
    coordinates: [Number],
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

adminSchema.virtual("pdfs", {
  ref: "Userdata",
  localField: "qr_id",
  foreignField: "shop_id",
});

adminSchema.methods.toJSON = function () {
  const admin = this.toObject(); // this will return a clone object so we can delete from that

  delete admin.password;
  delete admin.tokens;

  return admin;
};

adminSchema.methods.getauthtoken = function () {
  const admin = this;
  const token = jwt.sign(
    { _id: admin._id.toString() },
    "mynameisprajapatichirag",
    {
      expiresIn: "24h", // expires in 24 hours
    }
  );
  return token;
};

adminSchema.statics.findbyCredentials = async (email, password) => {
  const admin = await Admin.findOne({ email });
  if (admin == null) {
    throw {
      message: "Invalide Login details!",
      status: 502,
      validityStatus: "email",
    };
  }
  const compare = await bcrypt.compare(password, admin.password);
  if (!compare) {
    throw {
      message: "Invalide Password !",
      status: 502,
      validityStatus: "password",
    };
  }
  return admin;
};

adminSchema.methods.genrateQrId = function () {
  const qrId = crypto.randomBytes(32).toString("hex");
  this.qr_id = qrId;
};

adminSchema.methods.createresettoken = function () {
  const resettoken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resettoken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 5 * 60 * 1000;
  return resettoken;
};

adminSchema.pre("save", async function (next) {
  const admin = this;
  if (admin.isModified("password")) {
    admin.password = await bcrypt.hash(admin.password, 8);
  }
  next();
});
adminSchema.index({ location: "2dsphere" });
const Admin = new mongoose.model("Admindata", adminSchema);
module.exports = Admin;
