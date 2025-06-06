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


//nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail", // or 'hotmail', 'yahoo', or custom SMTP
  auth: {
    user: "myomin439420@gmail.com",
    pass: "ppnmm2012dubai",
  },
});


const sendVerificationEmail = async (to, link) => {
  const mailOptions = {
    from:"myomin439420@gmail.com",
    to,
    subject: "Verify your email",
    html: `<p>Please verify your email by clicking the link below:</p>
           <a href="${link}">${link}</a>`,
  };

  return transporter.sendMail(mailOptions);
};



router.post('/subscribe', async (req, res) => {
    console.log("req body",req.body);
  const email  = req.body.email;
  const token = crypto.randomBytes(20).toString('hex');
  const expiresAt = Date.now() + 3600000;

  pendingSubscriptions.set(token, { email, expiresAt });
  const verificationLink = `${APP_URL}/auth/verify?token=${token}`;


   try {
    await sendVerificationEmail(email, verificationLink);
    const success = success("Verification email sent. Check your inbox.")
    res.json(success);
  } catch (err) {
    const fail = error("Nodemailer error:", err);
    res.json(fail);
  }

});

router.get('/verify', (req, res) => {
  const token = req.query.token;
  const subscription = pendingSubscriptions.get(token);
  if (!subscription) {
    const error = error('Invalid token')
    return res.json(error);
  }
  if (Date.now() > subscription.expiresAt) {
    pendingSubscriptions.delete(token);
    const error = error('Token expired')
    return res.json(error);
  }
  pendingSubscriptions.delete(token);
  console.log(`Verified email: ${subscription.email}`);
  const success = success("Email verified successfully");
  res.json(success);
});

module.exports = router;
