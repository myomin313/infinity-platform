require("dotenv").config();
const express = require("express");
const axios = require("axios");

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
const authenticateToken = require('../commonFunctions/authenticateToken');

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

/**
 * @swagger
 * /contact/send:
 *   post:
 *     summary: Submit the contact form (JWT Protected)
 *     tags:
 *       - Contact
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
 *               - address
 *               - city
 *               - country
 *               - captcha
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               contactNumber:
 *                 type: string
 *                 example: +1234567890
 *               address:
 *                 type: string
 *                 example: 123 Main St
 *               addressTwo:
 *                 type: string
 *                 example: Suite 456
 *               city:
 *                 type: string
 *                 example: New York
 *               country:
 *                 type: string
 *                 example: United States
 *               saas:
 *                 type: string
 *                 example: Yes
 *               hosted:
 *                 type: string
 *                 example: No
 *               desiredDate:
 *                 type: string
 *                 example: 2025-07-01
 *               captcha:
 *                 type: string
 *                 description: Captcha token for verification
 *                 example: 03AGdBq27aL_example_token
 *     responses:
 *       200:
 *         description: Contact form successfully submitted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   example:
 *                     message: Thank you for contacting us. We will get back to you soon.
 *       400:
 *         description: Captcha verification failed or missing required fields
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
 *                   example: Invalid captcha or missing fields
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
 *                   example: Server encountered an error while processing the request
 */




router.post("/send", authenticateToken,upload.none(), async (req, res) => {
  
  try {
 

    let isRequired = checkRequiredFields(["name", "email","CompanyRegistrationId","contactNumber","phone","address1","city","country","captcha","selectedSaas","desiredStartDate"], req.body);

     console.log("hello");
    // const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.CAPTCHA_SECRET_KEY}&response=${req.body.captcha}`;

    // const { data } = await axios.post(verifyURL);

    // if (!data.success) {
    //   return res.status(400).json({ message: "captcha verification failed" });
    // }
    
    if (isRequired) {
      console.log("send required fields response");
      let response = requiredParams(isRequired);
      return res.json(response);
    } else {
      let name = req.body.name;
      let userEmail = req.body.email;
      let contactNumber = req.body.contactNumber;
      let address = req.body.address1;
      let addressTwo = req.body.address2;
      let city = req.body.city;
      let country = req.body.country;
      let saas = req.body.selectedSaas;
      let hosted = req.body.selectedSelfHosted;
      let desiredDate = req.body.desiredStartDate;
      let zipcode = req.body.zipcode;
      const isValid = isValidEmail(userEmail);

      if (isValid) {

        let newContact = new contactModel({
                  name: name,
                  email: userEmail,
                  contactNumber:contactNumber,
                  address:address,
                  addressTwo:addressTwo,
                  city:city,
                  country:country,
                  saas:saas,
                  hosted:hosted,
                  desiredDate:desiredDate,
                  zipcode:zipcode,
                });

        let result = await newContact.save();
        // Prepare message for SNS
    const snsMessage = `
New Contact Submission:
Name: ${name}
Email: ${userEmail}
Contact Number: ${contactNumber}
Address: ${address}, ${addressTwo || ''}
City: ${city}
Country: ${country}
SaaS: ${saas}
Hosted: ${hosted}
Desired Date: ${desiredDate}
`;
 
  console.log("process env arn", process.env.arn);
    // Publish to SNS
  const command = new PublishCommand({
      Message: snsMessage,
      Subject: "OST Infinity Platform Contact Form Submission",
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
