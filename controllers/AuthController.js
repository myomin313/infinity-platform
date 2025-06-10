const express = require("express");
const router = express.Router();
const { checkRequiredFields } = require("../commonFunctions/validate");
const userModel = require('../models/userModels');
const {
  success,
  error,
  requiredParams,
  conflict,
  invalidEmail,
  internalError,
  notFound
} = require("../commonFunctions/response");

const crypto = require('crypto');

const nodemailer = require("nodemailer");

const pendingSubscriptions = new Map();

const APP_URL = process.env.APP_URL;
const multer = require('multer');
const upload = multer();

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",        // Outlook SMTP server
  port: 587,                         // TLS port
  secure: false,                     // Use STARTTLS, not SSL
  auth: {
    user: process.env.EMAIL_SENDER,  // Your full Outlook email
    pass: process.env.EMAIL_PASSWORD, // See below for important note
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

const sendVerificationEmail = async (to, link) => {
  //console.log("user",process.env.sendMail);
    try {
let info = await transporter.sendMail({
  from: `"OST Platform" <${process.env.EMAIL_SENDER}>`,
  to: `${to}`,
  subject: "Welcome to OST Platform - Verify Your Email",
  text: `Please use this to verify your email.`,
  html: `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;border:1px solid #eee;border-radius:6px;">
      <div style="background:#0078ff;color:#fff;padding:20px;text-align:center;border-top-left-radius:6px;border-top-right-radius:6px;">
        <h2 style="margin:0;"> OST Platform</h2>
      </div>
      <div style="padding:30px;">
        <p> OST Platform!</p>
        <p>We're thrilled to have you on board. To get started and ensure your account is secure, please use click the link Below.</p>
        <p style="font-size:16px;"> <span style="color:#0078ff;font-weight:bold;font-size:20px;"><a href="${link}">${link}</a></span></p>
        <p>Welcome aboard, and happy exploring!</p>
        <p style="margin-top:40px;">Best regards,<br/>Team OST</p>
      </div>
    </div>
  `,
});
} catch (err) {
     console.error("Nodemailer:", err);
   
   }

};


router.post('/subscribe', upload.none(), async (req, res) => {
  //  console.log("req body",req.body);
  try {
  const email  = req.body.email;
  const token = crypto.randomBytes(20).toString('hex');
  const expiresAt = Date.now() + 3600000;

  pendingSubscriptions.set(token, { email, expiresAt });
  const verificationLink = `${APP_URL}/auth/verify?token=${token}`;
  console.log("verificationLink",verificationLink)
   
    await sendVerificationEmail(email, verificationLink);
    console.log("Verification email sent. Check your inbox.");

   const result = success("Verification email sent", {
      email: email,
      token: token,
    });
    return res.json(result);
  
  } catch (err) {
    const fail = error("Nodemailer error:", err);
   return res.json(fail);
  }
});

router.get('/verify', (req, res) => {
  const token = req.query.token;
  console.log("token",token);
 
  const subscription = pendingSubscriptions.get(token);

  if (!subscription) {
    const response = error('Invalid token',)
    return res.json(response);
  }
  if (Date.now() > subscription.expiresAt) {
    pendingSubscriptions.delete(token);
    const response = error('Token expired',)
    return res.json(response);
  }
  pendingSubscriptions.delete(token);
  console.log(`Verified email: ${subscription.email}`);
  const response = success("Email verified successfully");
  res.json(response);
});

module.exports = router;
