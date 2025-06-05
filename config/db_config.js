const mongoose = require("mongoose");
require("dotenv").config();
 
const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;
  console.log("MONGODB_URI:", MONGODB_URI);
 
  try {
    await mongoose.connect(MONGODB_URI);
 
    mongoose.connection.once("open", () => {
      console.log("MongoDB connected successfully.");
 
      mongoose.connection.on("disconnected", () => {
        console.log("MongoDB disconnected at", new Date());
      });
 
      mongoose.connection.on("reconnected", () => {
        console.log("MongoDB reconnected at", new Date());
      });
 
      mongoose.connection.on("error", (err) => {
        console.log("MongoDB error:", err, "at", new Date());
      });
    });
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit if unable to connect
  }
};
 
module.exports = connectDB;