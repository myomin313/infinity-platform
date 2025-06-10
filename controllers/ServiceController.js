const express = require("express");
const router = express.Router();
const path = require('path');


const serviceModel = require('../models/serviceModel');

const {
  success,
  error,
  requiredParams,
  conflict,
  invalidEmail,
  internalError,
  notFound
} = require("../commonFunctions/response")

router.get("/", async (req, res) => {
 try {
    const services = await serviceModel.find({});  
    const  response = success("success",services)
      return res.json(response);
  } catch (err) {
   const response = error(err.message)
      return res.json(response);  
  }
});

router.get("/download", async (req, res) => {
  const filePath = path.join(__dirname, '../commonFunctions', 'service.pdf');

  res.download(filePath, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).json({ message: "File not found or unable to download." });
    }
  });
  
});

module.exports = router;
