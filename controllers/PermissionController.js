const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const { checkRequiredFields } = require("../commonFunctions/validate");
const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const permissionModel = require('../models/permissionModel');
const feedbackModel = require('../models/feedbackModel');
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
    const permissions = await permissionModel.find({}, { password: 0 }).sort({ createdAt: -1 });
    console.log("permission",permissions);
    const response = success("permission  list", permissions);
    return res.json(response);
  } catch (err) {
    const response = error(err);
    return  res.json(response);
  }
});


router.post("/create",authenticateToken,upload.none(),async (req, res) => {
     console.log("hello",req.body);
  try {
    let isRequired = checkRequiredFields(["permissionName"], req.body);
    
    if (isRequired) {
      let response = requiredParams(isRequired);
      return res.json(response);
    } else {
      let permissionName = req.body.permissionName;
      let isPermissionNamelExist = await permissionModel
                 .findOne({ permissionName: permissionName })
                 .exec();
        if (isPermissionNamelExist) {
         const response = error(`We have already ${isPermissionNamelExist}`)
          return res.json(response);
        } else {
            let newPermission = new permissionModel({
                permissionName: permissionName
            });
            let result = await newPermission.save(); 
            console.log("result",result);
            console.log("result_id", result._id);
            const  permissionId = result._id;
            let response = success("new user created", {
                  permissionId, 
                  permissionName
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
    const permissionId = req.params.id;
    const { permissionName } = req.body;

    if (!permissionName) {
      return res.json(requiredParams(["permissionName"]));
    }

    const existingPermission = await permissionModel.findById(permissionId);
    if (!existingPermission) {
      return res.json(error("Permission not found"));
    }
    const nameExists = await permissionModel.findOne({
      permissionName,
      _id: { $ne: permissionId }
    });

    if (nameExists) {
      return res.json(error(`Permission name '${permissionName}' already exists`));
    }


    existingPermission.permissionName = permissionName;
    const updatedPermission = await existingPermission.save();

    return res.json(success("Permission updated successfully", {
        permissionId: updatedPermission._id,
        permissionName: updatedPermission.permissionName
    }));

  } catch (err) {
    console.error("Update permission error:", err);
    return res.json(error("An error occurred while updating the permission"));
  }
});


module.exports = router;

