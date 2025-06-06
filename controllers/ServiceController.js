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
  //const { search, category } = req.query;

 try {
    const services = await serviceModel.find({});  
  //    success = success("success",services)
   //res.json(services);

     res.json({
    status: "success",
    data: services
  });

  } catch (error) {
    //console.error(error);
   const response = error(error)
      return res.json(response);  
  }
});

router.get("/download", async (req, res) => {
  //const { search, category } = req.query;
  //const fileName = req.params.filename;
  const filePath = path.join(__dirname, '../commonFunctions', 'service.pdf');

  res.download(filePath, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).json({ message: "File not found or unable to download." });
    }
  });
  
});

module.exports = router;
