require("dotenv").config();
const express = require("express");
//const AWS = require("aws-sdk");

const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const contactModel = require('../models/contactModels');
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

const snsClient = new SNSClient({
  region: "ap-southeast-2",
  credentials: {
    accessKeyId: "AKIAZ7OS73CZMWGEXBLI",
    secretAccessKey: "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"
  }
});
const arn = "arn:aws:sns:ap-southeast-2:686026643634:contact-notifications";

const router = express.Router();

function isValidEmail(email) {
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailPattern.test(email);
}
// endpoint for contact send mail
router.post("/send", async (req, res) => {
  
  try {
    console.log("contact form data", req.body);

    let isRequired = checkRequiredFields(["name", "email","contactNumber","address","city","country"], req.body);

    if (isRequired) {
      console.log("send required fields response");
      let response = requiredParams(isRequired);
      return res.json(response);
    } else {
      let name = req.body.name;
      let userEmail = req.body.email;
      let contactNumber = req.body.contactNumber;
      let addressOne = req.body.addressOne;
      let addressTwo = req.body.addressTwo;
      let city = req.body.city;
      let country = req.body.city;
      let saas = req.body.saas;
      let hosted = req.body.hosted;
      let desiredDate = req.body.desiredDate;
      const isValid = isValidEmail(userEmail);

      if (isValid) {

        let newContact = new contactModel({
                  name: name,
                  email: userEmail,
                  contactNumber:contactNumber,
                  addressOne:addressOne,
                  addressTwo:addressTwo,
                  city:city,
                  country:country,
                  saas:saas,
                  hosted:hosted,
                  desiredDate:desiredDate
                });

        let result = await newContact.save();


        // Prepare message for SNS
    const snsMessage = `
New Contact Submission:
Name: ${name}
Email: ${userEmail}
Contact Number: ${contactNumber}
Address: ${addressOne}, ${addressTwo || ''}
City: ${city}
Country: ${country}
SaaS: ${saas}
Hosted: ${hosted}
Desired Date: ${desiredDate}
`;
console.log("No error");
    // Publish to SNS
  const command = new PublishCommand({
      Message: snsMessage,
      Subject: "OST Infinity Platform Contact Form Submission",
      TopicArn: arn // Make sure this is set in your .env
  });

    try{
       await snsClient.send(command);
       console.log("success in mail send")
    } catch (err) {
    // console.error("try catch error", err); // Log full error
    //let response = internalError();
    return res.status(500).json(err); // Use appropriate status code
  }


        let response = success("Thank you for contacting us!");
        return res.json(response);
         
      } else {
        console.log("invalid part called");
        let response = invalidEmail();
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
