const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const userAuth = async (req, res, next) => {
  // read the cookie from the request

  try {
    const cookies = req.cookies;
    const { token } = cookies;
    if (!token) {
      return res.status(401).send("Token not found...!");
    }
    // validate token
    const decodedMessage = await jwt.verify(token, "JWT_SECRET_KEY");
    const { _id } = decodedMessage;
    const user = await User.findById(_id);
    if (!user) {
      return res.status(401).send("User not found...!");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send("Invalid token...!");
  }
};
module.exports = userAuth;
