const mongoose = require("mongoose");

const ConnectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

module.exports = ConnectDB;

// mongoose .connect will return a promise and there will be two cases either success or failure
