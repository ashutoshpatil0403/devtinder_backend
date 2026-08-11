const mongoose = require("mongoose");
const validator = require("validator");

const contactUsSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address :" + value);
        }
      },
    },
    mobileNo: {
      type: String,
      required: true,
      trim: true,
      validate(value) {
        if (!validator.isMobilePhone(value, "en-IN")) {
          throw new Error("Invalid Phone Number: " + value);
        }
      },
    },
    message: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

const ContactUsModel = mongoose.model("contactUs", contactUsSchema);
module.exports = ContactUsModel;
