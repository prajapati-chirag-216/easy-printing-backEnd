const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    shop_id: {
      type: String,
      ref: "Admindata",
    },
    files: {
      type: [
        {
          filetype: {
            type: String,
          },
          fileData: Array,
          // fileData: [
          //   {
          //     file: Buffer,
          //     fileName: String,
          //   },
          // ],
        },
      ],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getusertoken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "mynameisprajapatiuser");
  return token;
};

const User = new mongoose.model("Userdata", userSchema);
module.exports = User;
