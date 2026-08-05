const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const User = require("../models/user.model");
const { ValidateSignUp } = require("../utils/Validation");
const jwt = require("jsonwebtoken");

authRouter.post("/signup", async (req, res) => {
  try {
    // data sanitization required here
    ValidateSignUp(req);

    const { firstName, lastName, emailId, password, age, gender } = req.body;

    // password hashing required here
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      age,
      gender,
    });
    await newUser.save();
    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials...!");
    }
    const isPasswordValid = await user.ValidatePassword(password);
    if (isPasswordValid) {
      // create jwt token
      const token = await user.getJWT();

      // add token to cookie and send the responce back to user
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
      res
        .status(200)
        .json({ success: true, message: "Login successful", data: user });
    } else {
      throw new Error("Invalid credentials...!");
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.status(200).json({ success: true, message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Step 1: User submits emailId, gets a reset token in a cookie
authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { emailId } = req.body;
    if (!emailId) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate a reset token with short expiry
    const resetToken = jwt.sign(
      { _id: user._id, purpose: "password-reset" },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      },
    );

    // Send reset token via cookie
    res.cookie("resetToken", resetToken);

    res.status(200).json({
      success: true,
      message: "Use /reset-password to set a new password",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Step 2: User submits new password with the reset token cookie
authRouter.post("/reset-password", async (req, res) => {
  try {
    const { resetToken } = req.cookies;
    if (!resetToken) {
      return res
        .status(401)
        .json({ success: false, message: "Reset token missing or expired" });
    }

    // Verify the reset token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.purpose !== "password-reset") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const { newPassword } = req.body;
    if (!newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New password is required" });
    }

    // Hash the new password and update
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(decoded._id, { password: passwordHash });

    // Clear the reset token cookie
    res.clearCookie("resetToken");

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.clearCookie("resetToken");
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = authRouter;
