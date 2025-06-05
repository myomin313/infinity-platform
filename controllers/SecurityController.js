const express = require("express");
const router = express.Router();


const securityModel = require('../models/securityModel');

const {
  success,
  error,
  requiredParams,
  conflict,
  invalidEmail,
  internalError,
  notFound
} = require("../commonFunctions/response")

router.get("/", async (req, res) => {


 try {
    const securities = await securityModel.find({});  
     res.json({
    status: "success",
    data: securities
  });

  } catch (error) {

   const response = error(error)
      return res.json(response);  
  }
});

module.exports = router;
