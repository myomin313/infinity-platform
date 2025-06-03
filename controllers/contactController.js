require("dotenv").config();
const express = require("express");




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

const router = express.Router();


function isValidEmail(email) {
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailPattern.test(email);
}
// endpoint for contact send mail
router.post("/send", async (req, res) => {
  try {
    console.log("contact form data", req.body);

    let isRequired = checkRequiredFields(["name", "email", "message"], req.body);

    if (isRequired) {
      console.log("send required fields response");
      let response = requiredParams(isRequired);
      return res.json(response);
    } else {
      let name = req.body.name;
      let userEmail = req.body.email;
      let message = req.body.message;
      const isValid = isValidEmail(userEmail);

      if (isValid) {

        let newContact = new contactModel({
                  name: name,
                  email: userEmail,
                  message: message
                });

        let result = await newContact.save();

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
