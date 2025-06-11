const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { checkRequiredFields } = require("../commonFunctions/validate");
const upload = require("../commonFunctions/upload"); // path to multer middleware
const CaseStudy = require("../models/casestudyModel");
const {
  success,
  error,
  requiredParams,
  conflict,
  invalidEmail,
  internalError,
  notFound
} = require("../commonFunctions/response");


// POST /api/case-studies
/**
 * @swagger
 * /case-study/create:
 *   post:
 *     summary: Create a new case study
 *     tags:
 *       - Case Study
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - industry
 *               - clientName
 *               - country
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               industry:
 *                 type: string
 *               clientName:
 *                 type: string
 *               country:
 *                 type: string
 *               logo:
 *                 type: string
 *                 format: binary
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
 *                   example: case study created
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal server error
 */

router.post("/create", upload.single("logo"), async (req, res) => {
  try {
    const { title, description, industry, clientName, country } = req.body;

    const newCase = new CaseStudy({
      title,
      description,
      industry,
      clientName,
      country,
      logoUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });

    await newCase.save();

    const response = success("case study created",{
       newCase
    })
     return res.json(response);
  } catch (err) {
    const response = error(err);
     return res.json(response);
  }
});
/**
 * @swagger
 * /case-study:
 *   get:
 *     summary: Get all case studies
 *     tags:
 *       - Case Study
 *     responses:
 *       200:
 *         description: A list of case studies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       industry:
 *                         type: string
 *                       clientName:
 *                         type: string
 *                       country:
 *                         type: string
 *                       logoUrl:
 *                         type: string
 *                         example: https://yourdomain.com/uploads/logo.png
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */

router.get("/", async (req, res) => {
  try {
    const cases = await CaseStudy.find().sort({ createdAt: -1 });
    const updatedCases = cases.map(cs => {
      const caseObj = cs.toObject(); // convert Mongoose doc to plain object
      if (caseObj.logoUrl && !caseObj.logoUrl.startsWith("http")) {
        caseObj.logoUrl = `${req.protocol}://${req.get("host")}${caseObj.logoUrl}`;
      }
      return caseObj;
    });

    res.json({ success: true, data: updatedCases });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
/**
 * @swagger
 * /case-study/search:
 *   get:
 *     summary: Search case studies by title or industry
 *     tags:
 *       - Case Study
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword for case study title
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Industry to filter case studies
 *     responses:
 *       200:
 *         description: Filtered case studies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       industry:
 *                         type: string
 *                       clientName:
 *                         type: string
 *                       country:
 *                         type: string
 *                       logoUrl:
 *                         type: string
 *                         example: https://yourdomain.com/uploads/logo.png
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */


router.get("/search", async (req, res) => {
  try {
    const { q, industry } = req.query;
    const filter = {
      ...(q && { title: new RegExp(q, "i") }),
      ...(industry && { industry }),
    };

    const result = await CaseStudy.find(filter);

    // Append full domain URL to logoUrl
    const updatedResult = result.map(item => {
      const obj = item.toObject();
      if (obj.logoUrl && !obj.logoUrl.startsWith("http")) {
        obj.logoUrl = `${req.protocol}://${req.get("host")}${obj.logoUrl}`;
      }
      return obj;
    });

    res.json({ success: true, data: updatedResult });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
