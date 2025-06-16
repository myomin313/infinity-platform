const express = require("express");
const router = express.Router();

const svgCaptcha = require('svg-captcha');

let lastCaptchaText = ''; 

router.get("/", (req, res) => {
   const captcha = svgCaptcha.create();
     lastCaptchaText = captcha.text; 
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('X-Captcha-Text', captcha.text); 
      res.status(200).send(captcha.data);
});

router.get('/captcha-text', (req, res) => {
  res.json({ text: lastCaptchaText });
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
