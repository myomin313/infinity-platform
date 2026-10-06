const express = require("express");
const router = express.Router();
const { checkRequiredFields } = require("../commonFunctions/validate");
const permissionModel = require('../models/permissionModel');
const policyModel = require('../models/policyModel');
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

router.get("/",authenticateToken,async (req, res) => {
  try {
    const policies = await policyModel.find({}).sort({ createdAt: -1 });
    console.log("policy",policies);
    const response = success("policy  list", policies);
    return res.json(response);
  } catch (err) {
    const response = error(err);
    return  res.json(response);
  }
});


router.post("/create",authenticateToken,upload.none(),async (req, res) => {
     console.log("hello",req.body);
  try {
    let isRequired = checkRequiredFields(["policyName"], req.body);
    
    if (isRequired) {
      let response = requiredParams(isRequired);
      return res.json(response);
    } else {
      let policyName = req.body.policyName;
      let description = req.body.description;
      let isPolicyExist = await permissionModel
                 .findOne({ policyName: policyName })
                 .exec();
        if (isPolicyExist) {
         const response = error(`We have already ${isPolicyExist}`)
          return res.json(response);
        } else {
            let newPolicy = new policyModel({
                policyName: policyName,
                description:description,
            });
            let result = await newPolicy.save(); 
            console.log("result",result);
            console.log("result_id", result._id);
            const policyId = result._id;
            let response = success("new user created", {
                  policyId, 
                  policyName,
                  description
            });
           return res.json(response);
        }
    }
  } catch (err) {
    console.log({ err });
    const response =  error("error")
    return res.json(response);
  }
});


router.put("/update/:id", authenticateToken, upload.none(), async (req, res) => {
  try {
    const policyId = req.params.id;
    const { policyName,description } = req.body;

    if (!policyName) {
      return res.json(requiredParams(["policyName"]));
    }

    const existingPolicy = await policyModel.findById(policyId);
    if (!existingPolicy) {
      return res.json(error("Policy not found"));
    }
    const nameExists = await policyModel.findOne({
      policyName,
      _id: { $ne: policyId }
    });

    if (nameExists) {
      return res.json(error(`Policy name '${policyName}' already exists`));
    }


    existingPolicy.policyName = policyName;
    existingPolicy.description = description;
    const updatedPolicy = await existingPolicy.save();

    return res.json(success("Policy updated successfully", {
        policyId: updatedPolicy._id,
        policyName: updatedPolicy.policyName,
        description: updatedPolicy.description,
    }));

  } catch (err) {
    console.error("Update Policy error:", err);
    return res.json(error("An error occurred while updating the Policy"));
  }
});


module.exports = router;

