const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { checkRequiredFields } = require("../commonFunctions/validate");
const upload = require("../commonFunctions/upload"); // path to multer middleware
const CaseStudy = require("../models/casestudyModel");
const authenticateToken = require('../commonFunctions/authenticateToken');
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
 *     summary: Create a new case study (JWT Protected)
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
 *               - description
 *               - industry
 *               - clientName
 *               - country
 *             properties:
 *               title:
 *                 type: string
 *                 example: AI-Driven Banking Automation
 *               description:
 *                 type: string
 *                 example: A case study on deploying AI for transaction classification
 *               industry:
 *                 type: string
 *                 example: Finance
 *               clientName:
 *                 type: string
 *                 example: MyBank Corp
 *               country:
 *                 type: string
 *                 example: Germany
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
 *                   example: Case study created
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "64b8fd2a9b9ad72dc8831ef2"
 *                     title:
 *                       type: string
 *                     logoUrl:
 *                       type: string
 *                       example: /uploads/case-studies/logo123.png
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
 *                   example: Server error occurred while creating case study.
 */


router.post("/create",authenticateToken, upload.single("logo"), async (req, res) => {
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
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of case studies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "665bc3d72fce123456789abc"
 *                       title:
 *                         type: string
 *                         example: AI-Powered Fraud Detection
 *                       description:
 *                         type: string
 *                         example: Improving fraud detection accuracy using ML.
 *                       industry:
 *                         type: string
 *                         example: Banking
 *                       clientName:
 *                         type: string
 *                         example: ABC Bank Ltd.
 *                       country:
 *                         type: string
 *                         example: United Kingdom
 *                       logoUrl:
 *                         type: string
 *                         example: https://yourdomain.com/uploads/logo.png
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-06-01T12:00:00Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-06-05T09:30:00Z
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
 *                   example: Unable to fetch case studies.
 */

router.get("/",authenticateToken, async (req, res) => {
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
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword for case study title or description (partial match, case-insensitive)
 *       - in: query
 *         name: industry
 *         schema:
 *           type: string
 *         description: Filter results by industry (exact match)
 *     responses:
 *       200:
 *         description: Filtered list of case studies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "665bc3d72fce123456789abc"
 *                       title:
 *                         type: string
 *                         example: Cloud Migration for FinTech
 *                       description:
 *                         type: string
 *                         example: Migrated infrastructure to AWS with zero downtime.
 *                       industry:
 *                         type: string
 *                         example: FinTech
 *                       clientName:
 *                         type: string
 *                         example: NeoBank Corp.
 *                       country:
 *                         type: string
 *                         example: Singapore
 *                       logoUrl:
 *                         type: string
 *                         example: https://yourdomain.com/uploads/logo.png
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-06-01T12:00:00Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: 2024-06-05T09:30:00Z
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
 *                   example: Failed to search case studies
 */

router.get("/search",authenticateToken, async (req, res) => {
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
