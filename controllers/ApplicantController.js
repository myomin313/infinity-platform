const express = require("express");
const router = express.Router();
const multer = require("multer");
const nodemailer = require("nodemailer");
const applicantModel = require("../models/applicantModel");
const path = require("path");
const fs = require("fs");

const authenticateToken = require('../commonFunctions/authenticateToken');



const { checkRequiredFields } = require("../commonFunctions/validate");
const {
  success,
  error,
  requiredParams,
  conflict,
  invalidEmail,
  internalError,
  notFound
} = require("../commonFunctions/response")


// ========== Multer Setup ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/job-applications/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  }
});
const upload = multer({ storage });

// ========== Nodemailer Setup ==========
const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD, // Secure this in .env
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

/**
 * @swagger
 * /apply:
 *   post:
 *     summary: Submit a new job application with uploaded documents (JWT Protected)
 *     tags:
 *       - Applicants
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *               - salutation
 *               - firstName
 *               - surname
 *               - country
 *               - postcode
 *               - city
 *               - street
 *               - house
 *               - dob
 *               - email
 *               - emailRepeat
 *               - telephone
 *               - authorizedToWork
 *               - requiredVisa
 *               - accessPersonalData
 *               - currentWorkingOstGroup
 *               - privacyPolicy
 *             properties:
 *               jobId:
 *                 type: string
 *               salutation:
 *                 type: string
 *               title:
 *                 type: string
 *               firstName:
 *                 type: string
 *               surname:
 *                 type: string
 *               surnameTitle:
 *                 type: string
 *               country:
 *                 type: string
 *               postcode:
 *                 type: string
 *               city:
 *                 type: string
 *               street:
 *                 type: string
 *               house:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               email:
 *                 type: string
 *                 format: email
 *               emailRepeat:
 *                 type: string
 *                 format: email
 *               telephone:
 *                 type: string
 *               authorizedToWork:
 *                 type: string
 *               requiredVisa:
 *                 type: string
 *               accessPersonalData:
 *                 type: string
 *               currentWorkingOstGroup:
 *                 type: string
 *               privacyPolicy:
 *                 type: string
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Application submitted and email sent to HR
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad Request - Email mismatch or missing fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid or expired token
 *       500:
 *         description: Internal Server Error
 */

// ========== Endpoint ==========
router.post("/", upload.array("documents"), async (req, res) => {
  try {
    let isRequired = checkRequiredFields(["jobId", "salutation", "firstName", "surname", "country",
      "postcode", "city", "street", "house", "dob", "email", "emailRepeat", "telephone", "authorizedToWork",
      "requiredVisa", "accessPersonalData", "currentWorkingOstGroup", "privacyPolicy"], req.body);
    if(!!isRequired) {
      return res.status(400).json({ error: "Required fields are missing" });
    }
    const {
      jobId, salutation, title, firstName, surname, surnameTitle,
      country, postcode, city, street, house,
      dob, email, emailRepeat, telephone, authorizedToWork, requiredVisa,
<<<<<<< HEAD
      accessPersonalData, currentWorkingOstGroup
=======
      accessPersonalData, currentWorkingOstGroup,fileDescriptions
>>>>>>> 6ae79c3 (add filedescriptions)
    } = req.body;
    // Check email match
    if (email !== emailRepeat) {
      return res.status(400).json({ error: "Emails do not match" });
    }
    // Prepare documents array
    const documentUrls = req.files.map(file =>
      `/uploads/job-applications/${file.filename}`
    );
    // Save to MongoDB
    const application = new applicantModel({
      jobId, salutation, title, firstName, surname, surnameTitle,
      country, postcode, city, street, house,
      dob: new Date(dob),
      email, telephone, authorizedToWork, requiredVisa, accessPersonalData, currentWorkingOstGroup,
      file_url: documentUrls,fileDescription:fileDescriptions

    });

    await application.save();

    // Prepare email to HR
    const hrEmail = "hr@ostinfinity.net";
    const mailOptions = {
      from: '"OST Careers" <donotreply@ostinfinity.net>',
      to: hrEmail,
      subject: `New Job Application from ${firstName} ${surname}`,
      html: `
        <h3>New Job Application Submitted</h3>
        <p><strong>Name:</strong> ${salutation} ${firstName} ${surname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${telephone}</p>
        <p><strong>Address:</strong> ${street}, ${house}, ${city}, ${postcode}, ${country}</p>
        <p><strong>DOB:</strong> ${dob}</p>
        <p>Documents attached below.</p>
      `,
      attachments: req.files.map(file => ({
        filename: file.originalname,
        path: file.path
      }))
    };

    await transporter.sendMail(mailOptions);

    res.json({ status: "success", message: "Application submitted and email sent to HR." });

  } catch (error) {
    console.error("Application error:", error);
    res.status(500).json({ status: "error", message: "Server error during application process" });
  }
});

module.exports = router;
