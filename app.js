const express = require("express");
const app = express();
const ConnectDB = require("./src/config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const authRouter = require("./src/routes/AuthRouter");
const profileRouter = require("./src/routes/ProfileRouter");
const requestRouter = require("./src/routes/RequestRouter");
const userRouter = require("./src/routes/UserRouter");
const dotenv = require("dotenv");
const contactUsRouter = require("./src/routes/ContactUsRouter");
dotenv.config();

let dbConnectionPromise;

const connectDatabase = () => {
  if (!dbConnectionPromise) {
    dbConnectionPromise = ConnectDB();
  }
  return dbConnectionPromise;
};

const normalizeOrigin = (origin) => origin.trim().replace(/\/$/, "");

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "")
        .split(",")
        .map(normalizeOrigin)
        .filter(Boolean);

      if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  }),
);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

app.use(async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    await connectDatabase();
    return next();
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: "Database unavailable",
    });
  }
});

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", contactUsRouter);

// app.get("/feed", async (req, res) => {
//   try {
//     const users = await User.find({});
//     res.status(200).json(users);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// app.get("/user/:id", async (req, res) => {
//   try {
//     // const searchedUserId = req.params.id;
//     // const user= await User.findById(searchedUserId);
//     const user = await User.findById(req.params.id);
//     res.status(200).json(user);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// app.delete("/user/:id",async(req, res)=>{
//   try{
//     // const deleteUserId = req.params.id;
//     // const user= await User.findById(deleteUserId);
//      const user= await User.findByIdAndDelete(req.params.id);
//      res.status(200).json({"message":"user deleted successfully"},user);

//   }catch(err){
//     res.status(500).send("Something went wrong...!");
//   }
// })

// app.delete("/user", async (req, res) => {
//   try {
//     const userId = req.body.userId;
//     // const user= await User.findByIdAndDelete({_id:userId});
//     const user = await User.findByIdAndDelete(userId);
//     res.status(200).json({ message: "user deleted successfully" }, user);
//   } catch (err) {
//     res.status(500).send(error.message);
//   }
// });

// app.patch("/user/:id", async (req, res) => {
//   try {
//       const userId = req.params.id;
//     const updatedData = req.body;
//     const user = await User.findByIdAndUpdate(userId, updatedData);
//     res.status(200).json({ message: "user updated successfully" }, user);

//   } catch (error) {
//     res.status(500).send("Something went wrong...!",error);
//   }
// });

// app.patch("/user/:userId", async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const updatedData = req.body;
//     const ALLOWED_UPDATES = ["age", "skills", "photoURL"];

//     const isUpdateAllowed = Object.keys(updatedData).every((k) => {
//       return ALLOWED_UPDATES.includes(k);
//     });

//     if (!isUpdateAllowed) {
//       throw new Error("Invalid updates...!");
//     }

//     if (updatedData?.skills.length > 10) {
//       throw new Error("Skills cannot be more than 10...!");
//     }

//     const user = await User.findByIdAndUpdate(userId, updatedData);
//     res.status(200).json({ message: "user updated successfully" }, user);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

connectDatabase()
  .then(() => {
    console.log("Database connected successfully...!");
    if (require.main === module) {
      app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT || 3000}`);
      });
    }
  })
  .catch((err) => {
    console.log(err.message);
  });

module.exports = app;
