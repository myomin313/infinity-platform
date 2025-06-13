const express = require("express");
const router = express.Router();

// const products = require('../commonFunctions/product.json')
// const {
//   success,
//   error,
//   requiredParams,
//   conflict,
//   invalidEmail,
//   internalError,
//   notFound
// } = require("../commonFunctions/response")

const svgCaptcha = require('svg-captcha');
let captchaText = '';

router.get("/", (req, res) => {
   const captcha = svgCaptcha.create();
     captchaText = captcha.text; // Save for verification
      res.type('svg');
     res.status(200).send(captcha.data);
//    const response = success("product list",filtered)
//    return res.json(response);
});

router.post('/verify', (req, res) => {
  const { userInput } = req.body;
  if (userInput === captchaText) {
    res.send({ success: true });
  } else {
    res.send({ success: false });
  }
});

module.exports = router;
