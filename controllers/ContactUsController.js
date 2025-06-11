require("dotenv").config();
const express = require("express");
const axios = require("axios");

const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const contactUsModel = require('../models/contactUsModel');
const { checkRequiredFields } = require("../commonFunctions/validate");
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
// endpoint for contact send mail
router.post("/submit", upload.none(), async (req, res) => {
  
  try {
    let isRequired = checkRequiredFields(["name", "email","contactNumber","productName"], req.body);

    if (isRequired) {
      console.log("send required fields response");
      let response = requiredParams(isRequired);
      return res.json(response);
    } else {
      let name = req.body.name;
      let email = req.body.email;
      let contactNumber = req.body.contactNumber;
      let productName = req.body.productName;
      const isValid = isValidEmail(email);

      if (isValid) {

        let newContact = new contactUsModel({
                  name: name,
                  email: email,
                  contactNumber:contactNumber,
                  productName:productName,
                });

        let result = await newContact.save();
    const snsMessage = `
New Contact Submission:
Name: ${name}
Email: ${email}
Contact Number: ${contactNumber}
Request Product Type: ${productName}}
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
         
      } else {
        console.log("invalid part called");
        let response = error(invalidEmail());
        return res.json(response);
      }
    }
  } catch (err) {
    console.log({ err });
    let response = internalError();
    return res.json(response);
  }
});

module.exports = router;
