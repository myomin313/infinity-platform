const express = require("express");
const router = express.Router();


const serviceModel = require('../models/serviceModel');

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
  //const { search, category } = req.query;

 try {
    const services = await serviceModel.find({});  
  //    success = success("success",services)
   //res.json(services);

     res.json({
    status: "success",
    data: services
  });

  } catch (error) {
    //console.error(error);
   const response = error(error)
      return res.json(response);  
  }
});

module.exports = router;
