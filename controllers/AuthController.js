const express = require("express");
const router = express.Router();
const { checkRequiredFields } = require("../commonFunctions/validate");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
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
const authenticateToken = require('../commonFunctions/authenticateToken');

const crypto = require('crypto');
const AWS = require('aws-sdk');

const nodemailer = require("nodemailer");

const pendingSubscriptions = new Map();

const APP_URL = process.env.APP_URL;
const multer = require('multer');
const upload = multer();
const RecoveryRequest = require('../models/recoveryModel');
const recoveryFeedbackModel =require('../models/recoveryFeedbackModel');


const snsClient = new SNSClient({
  region: process.env.sns_region,
  credentials: {
    accessKeyId: process.env.sns_accessKeyId,
    secretAccessKey: process.env.sns_secretAccessKey
  }
});



// const transporter = nodemailer.createTransport({
//   host: "smtp.office365.com",        // Outlook SMTP server
//   port: 587,                         // TLS port
//   secure: false,                     // Use STARTTLS, not SSL
//   auth: {
//     user: process.env.EMAIL_SENDER,  // Your full Outlook email
//     pass: process.env.EMAIL_PASSWORD, // See below for important note
//   },
//   tls: {
//     ciphers: 'SSLv3'
//   }
// });


const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD, // App password if MFA enabled
  },
  requireTLS: true,
  tls: {
    rejectUnauthorized: false, // Optional if using self-signed certs or older systems
  },
});


const sendRecoveryNotice = async(to,type)=>{
   
      try {
let info = await transporter.sendMail({
  from: `"Ost Infinity" <${process.env.EMAIL_SENDER}>`,
  to: `${to}`,
  subject: "Welcome to Ost Infinity - Recovery Account",
  text: `Please use this Account Id to verify your email.`,
  html: `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;border:1px solid #eee;border-radius:6px;">
      <div style="background:#0078ff;color:#fff;padding:20px;text-align:center;border-top-left-radius:6px;border-top-right-radius:6px;">
        <h2 style="margin:0;"> Ost Infinity</h2>
      </div>
      <div style="padding:30px;">
        <p> Ost Infinity!</p>
        <p>We're thrilled to have you on board. To get started and ensure your account is secure, please use click the link Below.</p>
        <p style="font-size:16px;"> <span style="color:#0078ff;font-weight:bold;font-size:20px;"><a href="${type}">${type}</a></span></p>
        <p>Welcome aboard, and happy exploring!</p>
        <p style="margin-top:40px;">Best regards,<br/>Team Ost Infinity</p>
      </div>
    </div>
  `,
});
} catch (err) {
     console.error("Nodemailer:", err);
   }

}

const sendVerificationEmail = async (to, link) => {
  //console.log("user",process.env.sendMail);
    try {
let info = await transporter.sendMail({
  from: `"Ost Infinity " <${process.env.EMAIL_SENDER}>`,
  to: `${to}`,
  subject: "Welcome to Ost Infinity  - Verify Your Email",
  text: `Please use this to verify your email.`,
  html: `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;border:1px solid #eee;border-radius:6px;">
      <div style="background:#0078ff;color:#fff;padding:20px;text-align:center;border-top-left-radius:6px;border-top-right-radius:6px;">
        <h2 style="margin:0;"> Ost Infinity </h2>
      </div>
      <div style="padding:30px;">
        <p> Ost Infinity !</p>
        <p>We're thrilled to have you on board. To get started and ensure your account is secure, please use click the link Below.</p>
        <p style="font-size:16px;"> <span style="color:#0078ff;font-weight:bold;font-size:20px;"><a href="${link}">${link}</a></span></p>
        <p>Welcome aboard, and happy exploring!</p>
        <p style="margin-top:40px;">Best regards,<br/>Team Ost Infinity</p>
      </div>
    </div>
  `,
});
} catch (err) {
     console.error("Nodemailer:", err);
   
   }

};

/**
 * @swagger
 * /auth/subscribe:
 *   post:
 *     summary: Subscribe with email and send verification link (JWT Protected)
 *     tags:
 *       - Subscription
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to subscribe
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: Verification email sent successfully
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
 *                   example: Verification email sent
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: user@example.com
 *                     token:
 *                       type: string
 *                       example: 9f1b7e2a3c4d5e6f7a8b9c0d1e2f3a4b
 *       401:
 *         description: Unauthorized - JWT token missing
 *       403:
 *         description: Forbidden - Invalid or expired JWT token
 *       500:
 *         description: Server error or email sending failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: Bad request
 *                 message:
 *                   type: string
 *                   example: "Nodemailer error: '<error message>'"

 */

router.post('/subscribe',authenticateToken,upload.none(), async (req, res) => {
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
/**
 * @swagger
 * /auth/verify:
 *   get:
 *     summary: Verify email subscription token (JWT Protected)
 *     tags:
 *       - Subscription
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The verification token sent via email
 *     responses:
 *       200:
 *         description: Email verified successfully
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
 *                   example: Email verified successfully
 *       400:
 *         description: Invalid or expired token
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
 *                   example: Token expired
 *       401:
 *         description: Unauthorized - JWT missing
 *       403:
 *         description: Forbidden - Invalid or expired JWT token
 */

router.get('/verify',authenticateToken,async (req, res) => {
  const token = req.query.token;
  console.log("token",token);
 
  const subscription =await pendingSubscriptions.get(token);

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

router.post('/account-recovery',authenticateToken, async (req, res) => {
  try {
     console.log("hello");
    const { email, describe } = req.body;

    if (!email || !describe) {
      return res.status(400).json({ message: 'Email and issue type are required.' });
    }
        let recovery_id ='';
       const request = new RecoveryRequest({
            email,
            issueType:describe,
            status: 'Pending',
            requestedAt: new Date()
        });
        const recovery= await request.save();
          recovery_id = recovery.id;
 
   const response = success("Your request has been submitted. It may take up to 2 working days.",
    {
      recovery_id,
      email,
      describe
    }
   );
    return res.json(response); 
  } catch (err) {
    console.log("error message",err.message)
    const response = error(err.message);
    return res.json(response);
   
  }
});


// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});


// Configure Multer for file uploads
// const uploadFile = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
// });

const uploadFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
    cb(null, true);
  }
});

// Account Recovery Endpoint
router.post('/account-recovery-id', uploadFile.array('files'), async (req, res) => {
  try {
    const { accountId, additionalDetails,recovery_id } = req.body;
    const files = req.files;

    console.log("accountId",accountId);
    const accountIdExit = await userModel.findOne({ accountId: accountId });

     console.log("recovery_id",accountIdExit);
    // Validate input
    if (!accountIdExit) {
      const response = error("your account Id is incorrect");
      return res.json(response);
    }

    // Upload files to S3
    const uploadPromises = files.map(file => {
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `recovery-docs/${Date.now()}-${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype
      };
      return s3.upload(params).promise();
    });

    const uploadedFiles = await Promise.all(uploadPromises);

  const fileLinks = uploadedFiles.map(f => f.Location).join('\n');


// Update recovery request by ID
    const updatedRecovery = await RecoveryRequest.findByIdAndUpdate(
      recovery_id,
      {
        additionalDetails,
        file_names: files.map(file => file.originalname),
        accountId
      },
      {
        new: true
      }
    );

    console.log("updatedRecovery",updatedRecovery);


       const snsMessage = `
    Recovery Account  Submission:


    email: ${updatedRecovery.email}
    Issue: ${updatedRecovery.issueType}
    account Id: ${updatedRecovery.accountId}
    Addition Details: ${updatedRecovery.additionalDetails}
    files: ${fileLinks}
    `;
      console.log("process env arn", process.env.arn);
        // Publish to SNS
      const command = new PublishCommand({
          Message: snsMessage,
          Subject: "OST Infinity Platform Recovery Submission",
          TopicArn: process.env.arn // Make sure this is set in your .env
      });
        try{
             await snsClient.send(command);
             console.log("success in mail send")
          } catch (err) {
               console.log(err.message);
          const response = error(err);
          return res.json(response);
        }

    

    
        const successSubmit = success("Recovery request submitted successfully");

        res.json(successSubmit);
    // res.status(200).json({
    //   message: 'Recovery request submitted successfully',
    //   files: uploadedFiles.map(f => f.Location)
    // });

  } catch (error) {
    console.error('Recovery error:', error);
    res.status(500).json({ error: 'Failed to process recovery request' });
  }
});


// Submit feedback
router.post('/feedback', async (req, res) => {
  try {
  
      console.log("participate",req.body.participate);

    const newFeedback = new recoveryFeedbackModel({
      selectedDescribeItems: req.body.selectedDescribeItems || [],
      accountId: req.body.accountId,
      age: req.body.age,
      gender: req.body.gender || null,
      experience: req.body.experience || null,
      goal: req.body.goal || null,
      challenge: req.body.challenge || null,
      challengeDetail: req.body.challengeDetail,
      intuitive: req.body.intuitive || null,
      lookingFor: req.body.lookingFor || null,
      searchFor: req.body.searchFor,
      feel: req.body.feel,
      like: req.body.like,
      recommend: req.body.recommend || null,
      toImprove:req.body.toImprove,
      missingFeature:req.body.missingFeature,
      participate :req.body.participate || null,
      location:req.body.location,
      submittedAt: new Date()
    });


    //start
     const snsMessage = `
    Recovery Account Feedback Submission:

    account Id:
    ${req.body.accountId}
    Which best describes you?: 
    ${req.body.selectedDescribeItems}
    Age:
    ${ req.body.age}
    Gender : 
    ${req.body.gender}
    Location:
    ${req.body.location}
    How would you rate your overall experience with ViXa Platform ?
    ${req.body.experience}
    How easy was it to complete your goal today ?
    ${req.body.goal}
    Did you encounter any challenges while using ViXA Platform ?
    ${req.body.challenge}
    Challenge Details:
     ${req.body.challengeDetail}
    How intuitive was the layout/menu structure ?
     ${req.body.intuitive}
    Where you able to find what you ware looking for?
    ${req.body.lookingFor}
    If not,what were you searching for ?
    ${req.body.searchFor}
    How did using ViXa Platform make you feel?
    ${req.body.feel}
    What did you like most / least ?
    ${req.body.like}
    How likely are you to recommend ViXa Platform to others ?
    ${req.body.recommend}
    What's one thing we could improve?
    ${req.body.toImprove}
    Is there a feature you are missing?
    ${req.body.missingFeature}
    Would you like to participate in future research ?
    ${req.body.participate}
    `;



     
      console.log("process env arn", process.env.arn);
        // Publish to SNS
      const command = new PublishCommand({
          Message: snsMessage,
          Subject: "OST Infinity Platform Feedback Submission",
          TopicArn: process.env.feedback_arn // Make sure this is set in your .env
      });


        try{
             await snsClient.send(command);
             console.log("success in mail send")
          } catch (err) {
               console.log(err.message);
          const response = error(err);
          return res.json(response);
        }

  
    //end
    await newFeedback.save();
    const response  = success("Feedback submitted successfully",{
      newFeedback
    });
    return res.json(response); 

  } catch (err) {

    const response = error(err.message);
    return res.json(response);
   
  }
});





module.exports = router;
