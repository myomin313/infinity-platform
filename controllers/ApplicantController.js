const express = require("express");
const router = express.Router();
const multer = require("multer");
const nodemailer = require("nodemailer");
const applicantModel = require("../models/applicantModel");
const path = require("path");
const fs = require("fs");

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
    user: process.env.sendMail,
    pass: process.env.sendMailPass, // Secure this in .env
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

// ========== Endpoint ==========
router.post("/", upload.array("documents"), async (req, res) => {
  try {
    let isRequired = checkRequiredFields(["jobId","salutation", "firstName", "surname","country",
        "postcode","city","street","house","dob","email","emailRepeat","telephone","authorizedToWork",
        "requiredVisa","accessPersonalData","currentWorkingOstGroup","privacyPolicy"], req.body);
    const {
      jobId,salutation, title, firstName, surname, surnameTitle,
      country, postcode, city, street, house,
      dob, email, emailRepeat, telephone,authorizedToWork,requiredVisa,
      accessPersonalData,currentWorkingOstGroup
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
      jobId,salutation, title, firstName, surname, surnameTitle,
      country, postcode, city, street, house,
      dob: new Date(dob),
      email, telephone,authorizedToWork,requiredVisa,accessPersonalData,currentWorkingOstGroup,
      file_url: documentUrls
    });

    await application.save();

    // Prepare email to HR
    const hrEmail = "myomin313@gmail.com";
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
