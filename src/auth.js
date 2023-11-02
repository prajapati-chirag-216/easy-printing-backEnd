const jwt = require("jsonwebtoken");
const Admin = require("./modal/admin_modal");

const auth = async (req, res, next) => {
  try {
    const token = req.cookies["token"];
    const decoded = jwt.verify(token, "mynameisprajapatichirag");
    const data = await Admin.findOne({
      _id: decoded._id,
    });
    if (!data || data.length === 0) {
      throw { message: "Admin is not LogedIn!" };
    }
    req.token = token;
    req.admin = data;
    next();
  } catch (err) {
    res.status(err.status || 404).send(err);
  }
};
module.exports = auth;
