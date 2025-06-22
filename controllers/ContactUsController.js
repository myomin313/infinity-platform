require("dotenv").config();
const express = require("express");
const axios = require("axios");

const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const contactUsModel = require('../models/contactUsModel');
const { checkRequiredFields } = require("../commonFunctions/validate");
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

const multer = require('multer');
const upload = multer();

const snsClient = new SNSClient({
  region: process.env.sns_region,
  credentials: {
    accessKeyId: process.env.sns_accessKeyId,
    secretAccessKey: process.env.sns_secretAccessKey
  }
});

const router = express.Router();

function isValidEmail(email) {
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailPattern.test(email);
}
/**
 * @swagger
 * /contact-us/submit:
 *   post:
 *     summary: Submit a contact-us form for product inquiry (JWT Protected)
 *     tags:
 *       - Contact Us
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - contactNumber
 *               - productName
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name of the user
 *                 example: Jane Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: jane.doe@example.com
 *               contactNumber:
 *                 type: string
 *                 description: Phone number for contact
 *                 example: +1234567890
 *               productName:
 *                 type: string
 *                 description: Name of the product inquired about
 *                 example: AI-powered Document Search
 *     responses:
 *       200:
 *         description: Contact form submitted successfully
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
 *                   example: contact form submit success
 *                 data:
 *                   type: object
 *                   example:
 *                     id: 60f7b3f9c4e6c2b9f8a7d5e1
 *                     name: Jane Doe
 *                     email: jane.doe@example.com
 *                     productName: AI-powered Document Search
 *       400:
 *         description: Missing required fields or invalid email
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
 *                   example: Email is required and must be valid
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
 *                   example: Something went wrong on the server
 */


router.post("/submit",authenticateToken, upload.none(), async (req, res) => {
    console.log("hello",req.body.name);
  try {
    // let isRequired = checkRequiredFields(["name", "email","contactNumber","productName"], req.body);

    // if (isRequired) {
    //   console.log("send required fields response");
    //   let response = requiredParams(isRequired);
    //   return res.json(response);
    // } else {
      let name = req.body.name;
      let email = req.body.email;
      let company = req.body.company;
      // let countryCode = req.body.countryCode;
      // let phone = +req.body.countryCode + req.body.phone;
      let phone = `${req.body.phone}${req.body.phoneNumber}`;
      let product = req.body.product;
      console.log("phone",req.body.phone);
      const isValid = isValidEmail(email);

      if (isValid) {

        let newContact = new contactUsModel({
                  name: name,
                  email: email,
                  company:company,
                  phone:phone,
                  product:product
                });

        let result = await newContact.save();
    const snsMessage = `
New Contact Submission:
Name: ${name}
Email: ${email}
Contact Number: ${phone}
Request Product Type: ${product}
`;

    // Publish to SNS
  const command = new PublishCommand({
      Message: snsMessage,
      Subject: "OST Infinity Platform Contact Us Submission",
      TopicArn: process.env.arn // Make sure this is set in your .env
  });

    try{
       await snsClient.send(command);
       console.log("success in mail send")
    } catch (err) {
    const response = error(err);
    return res.json(response);
  }
        let response = success("contact form submit success",newContact);
        return res.json(response);
         
      
    }
  } catch (err) {
    console.log({ err });
    let response = internalError();
    return res.json(response);
  }
});

module.exports = router;
