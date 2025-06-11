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
