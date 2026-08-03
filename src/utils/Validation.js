const validator = require("validator");

const ValidateSignUp = (req) => {
  const { firstName, lastName, emailId, password, age } = req.body;

  if (!firstName || !lastName || !emailId || !password || !age) {
    throw new Error("All fields are required");
  } else if (age < 18) {
    throw new Error("Age must be more than 18 years");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Invalid email format");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong enough");
  }
};

const ValidateProfileEditData = (req) => {
  try {
    const allowedEditFields = [
      "firstName",
      "lastName",
      "gender",
      "age",
      "skills",
      "photoURL",
      "about",
      "gender",
    ];

    const isEditAllowed = Object.keys(req.body).every((key) => {
      return allowedEditFields.includes(key);
    });
    if (!isEditAllowed) {
      throw new Error("Invalid edit detected");
    }
  } catch (error) {
    throw new Error("Invalid edit detected");
  }
};

module.exports = { ValidateSignUp, ValidateProfileEditData };
