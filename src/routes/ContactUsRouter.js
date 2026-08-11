const express = require("express");
// const userAuth = require("../middlewares/auth");
const ContactUsModel = require("../models/contactUs.model");
const contactUsRouter = express.Router();

contactUsRouter.post("/contact-us", async (req, res) => {
  try {
    const { emailId, mobileNo, message } = req.body;

    if (!emailId || !mobileNo || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All Fields are Required" });
    }

    const isEmailAlreadyExists = await ContactUsModel.findOne({
      emailId: emailId,
    });

    if (isEmailAlreadyExists) {
      return res.status(400).json({
        success: false,
        message: "Request already exists by this Email ID",
      });
    }

    const isMobileNoExists = await ContactUsModel.findOne({
      mobileNo: mobileNo,
    });

    if (isMobileNoExists) {
      return res.status(400).json({
        success: false,
        message: "Request already exists by this Mobile Number",
      });
    }

    const contactUsNewRequest = await ContactUsModel.create({
      emailId: emailId,
      mobileNo: mobileNo,
      message: message,
    });

    res.status(200).json({
      success: true,
      message: "Request Submitted Successfully",
      data: contactUsNewRequest,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = contactUsRouter;
