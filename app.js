require("dotenv").config();
const express = require("express");
const app = express();
// ✅ These are required to parse JSON and form data
app.use(express.json()); // for application/json
app.use(express.urlencoded({ extended: true }));


const conf = require("./config");
const sharedConnection = require("./config/db_config");


const contactController = require("./controllers/ContactController");



const checkMongoConnection = (req, res, next) => {
  console.log("check db connection, called.", sharedConnection.readyState, req.body);
  if (sharedConnection.readyState === 1) {
    next();
  } else {
    return res.json({ status: "db not connected, Try again later !" });
  }
};

var server;

if (conf.env && conf.env !== "local") server = require("https").Server(app);
else if (conf.env && conf.env === "local") server = require("http").Server(app);
sharedConnection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");

 
 app.use("/contact", contactController);

  

  app.get("/", async (req, res) => {
    console.log("Ost api project!");
  });
});

module.exports = app;
