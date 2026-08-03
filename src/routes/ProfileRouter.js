const userAuth = require("../middlewares/auth");
const express = require("express");
const profileRouter = express.Router();
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const { ValidateProfileEditData } = require("../utils/Validation");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    ValidateProfileEditData(req);
    const user = req.user;
    const updatedData = req.body;
    const updatedUser = await User.findByIdAndUpdate(user._id, updatedData);
    res.status(200).json({ success: true, message: "Profile updated successfully", data: updatedUser });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
//   try {
//     ValidateProfileEditData(req);
//     const loggedInUser = req.user;
//
//     Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
//
//     await loggedInUser.save();
//
//     res.json({
//       message: `${loggedInUser.firstName}, your profile updated successfully`,
//       data: loggedInUser,
//     });
//   } catch (error) {
//     res.status(500).send("Internal Server Error...!");
//   }
// });

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { currentPassword, newPassword } = req.body;

    // Validate current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    // Hash and update new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.password = passwordHash;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = profileRouter;
