const express = require("express");
const router = express.Router();
const path = require('path');
const multer = require("multer");


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

const studyCaseModel = require('../models/studyCaseModel');

// Multer config
const storage = multer.diskStorage({
  destination: "uploads/", // store in /uploads
  filename: (req, file, cb) => {
    cb(null, `report-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });


router.post("/create", upload.single("file"), async (req, res) => {
  try {
    const { title, tags } = req.body;
    const fileName = `${req.file.filename}`;

    const newCase = new studyCaseModel({
      title,
      tags: tags?.split(",").map(tag => tag.trim()),
      fileName,
    });

    await newCase.save();
    const response =  success("case study created successfully",newCase);
   return res.json(response);
  } catch (err) {
    const response = error(err);
    return  res.json(response);
  }
});


router.get("/", async (req, res) => {
  try {
    const caseStudy = await studyCaseModel.find().sort({ createdAt: -1 });
    console.log("caseStudy",caseStudy);
    const response = success("case study  list", caseStudy);
    return res.json(response);
  } catch (err) {
    const response = error(err);
    return  res.json(response);
  }
});


router.get("/download", async (req, res) => {

  const fileName = req.query.fileName;
  if (!fileName) {
    const response = error("Missing file URL");
    return res.json(response);
  }
  const filePath = path.join(__dirname, '../uploads', fileName);
  res.download(filePath, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).json({ message: "File not found or unable to download." });
    }
  });
  
});


module.exports = router;
