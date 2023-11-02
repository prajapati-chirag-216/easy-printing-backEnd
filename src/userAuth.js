const jwt = require("jsonwebtoken");
const User = require("./modal/user_modal");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies["userToken"];
    const decoded = jwt.verify(token, "mynameisprajapatiuser");
    const data = await User.findOne({
      _id: decoded._id,
    });
    if (!data || data.length === 0) {
      throw { message: "There is such no file belong to this user!" };
    }
    req.token = token;
    req.user = data;
    next();
  } catch (err) {
    res.status(err.status || 404).send(err);
  }
};
module.exports = userAuth;
