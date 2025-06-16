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
} = require("../commonFunctions/response");
const authenticateToken = require('../commonFunctions/authenticateToken');

const studyCaseModel = require('../models/studyCaseModel');

// Multer config
const storage = multer.diskStorage({
  destination: "uploads/", // store in /uploads
  filename: (req, file, cb) => {
    cb(null, `report-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

/**
 * @swagger
 * /case-study/create:
 *   post:
 *     summary: Create a new case study
 *     tags:
 *       - Case Study
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - file
 *             properties:
 *               title:
 *                 type: string
 *                 example: AI-Driven Customer Support
 *               tags:
 *                 type: string
 *                 example: "AI, Support, Automation"
 *                 description: Comma-separated tags
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF or document file upload
 *     responses:
 *       200:
 *         description: Case study created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: case study created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     tags:
 *                       type: array
 *                       items:
 *                         type: string
 *                     fileName:
 *                       type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Unexpected server error
 */


router.post("/create",authenticateToken,upload.single("file"), async (req, res) => {
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

/**
 * @swagger
 * /study-case:
 *   get:
 *     summary: Retrieve list of case studies sorted by creation date (newest first)
 *     tags:
 *       - CaseStudies
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved case study list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: case study list
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64b2f1234c56789d01234567"
 *                       title:
 *                         type: string
 *                         example: "My Case Study"
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *                         example: ["tag1", "tag2"]
 *                       fileName:
 *                         type: string
 *                         example: "uploadfile12345.pdf"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-11T12:34:56.789Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-11T12:34:56.789Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */


router.get("/",authenticateToken,async (req, res) => {
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


/**
 * @swagger
 * /study-case/download:
 *   get:
 *     summary: Download a file by fileName query parameter
 *     tags:
 *       - CaseStudies
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fileName
 *         required: true
 *         schema:
 *           type: string
 *         description: Name of the file to download (e.g., case-study.pdf)
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Missing fileName query parameter
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Missing file URL
 *       500:
 *         description: File not found or unable to download
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File not found or unable to download.
 */


router.get("/download",authenticateToken,async (req, res) => {

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
