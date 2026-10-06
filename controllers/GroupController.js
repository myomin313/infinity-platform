const express = require("express");
const router = express.Router();
const { checkRequiredFields } = require("../commonFunctions/validate");
const mongoose = require('mongoose');
const policyModel = require('../models/policyModel');
const groupModel = require('../models/groupModel');
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
    const groups = await groupModel.find({}).sort({ createdAt: -1 });
    console.log("groups",groups);
    const response = success("groups  list", groups);
    return res.json(response);
  } catch (err) {
    const response = error(err);
    return  res.json(response);
  }
});


router.post("/create", authenticateToken, upload.none(), async (req, res) => {
  try {
    // Validate required fields
    const isRequired = checkRequiredFields(["groupName"], req.body);
    if (isRequired) {
      const response = requiredParams(isRequired);
      return res.json(response);
    }

    let { groupName, description, policies } = req.body;

    // Handle policies if sent as string (form-data)
    if (policies && typeof policies === 'string') {
      try {
        policies = JSON.parse(policies);
      } catch (e) {
        return res.json(error("Invalid policies format. Must be a valid JSON array"));
      }
    }

    // Check if group already exists
    const isGroupNameExist = await groupModel.findOne({ groupName }).exec();
    if (isGroupNameExist) {
      return res.json(error(`Group '${groupName}' already exists`));
    }

    // Validate policies if provided
    if (policies && Array.isArray(policies)) {
      // Convert string IDs to ObjectIds
     // const policyObjectIds = policies.map(id => mongoose.Types.ObjectId(id));

      const policyObjectIds = policies.map(id => new mongoose.Types.ObjectId(id));
      
      const validPolicies = await policyModel.countDocuments({ 
        _id: { $in: policyObjectIds } 
      });
      
    if (validPolicies !== policies.length) {
        return res.json(error("One or more invalid policy IDs provided"));
       }
    }

    // Create new group
    const newGroup = new groupModel({
      groupName,
      description: description || null,
      policies: policies || []
    });

    const savedGroup = await newGroup.save();

    // Return success response
    return res.json(success("Group created successfully", {
      groupId: savedGroup._id,
      groupName: savedGroup.groupName,
      description: savedGroup.description,
      policies: savedGroup.policies,
      createdAt: savedGroup.createdAt
    }));

  } catch (err) {
    console.error("Group creation error:", err);
    return res.json(error("An error occurred while creating the group"));
  }
});


router.put("/update/:id", authenticateToken, upload.none(), async (req, res) => {
  try {
    const groupId = req.params.id;
    const { groupName, description, policies } = req.body;
    if (!groupName) {
      return res.json(requiredParams(["groupName"]));
    }
    const existingGroup = await groupModel.findById(groupId);
    if (!existingGroup) {
      return res.json(error("Group not found"));
    }

    const nameExists = await groupModel.findOne({
      groupName,
      _id: { $ne: groupId }
    });

    if (nameExists) {
      return res.json(error(`Group name '${groupName}' already exists`));
    }
    if (policies && Array.isArray(policies)) {
      const policyObjectIds = policies.map(id => new mongoose.Types.ObjectId(id));
      const validPolicies = await policyModel.countDocuments({ 
        _id: { $in: policyObjectIds } 
      });
      
      if (validPolicies !== policies.length) {
        return res.json(error("One or more invalid policy IDs provided"));
      }
      
      existingGroup.policies = policyObjectIds;
    }
    existingGroup.groupName = groupName;
    existingGroup.description = description || existingGroup.description;

    const updatedGroup = await existingGroup.save();

    return res.json(success("Group updated successfully", {
      groupId: updatedGroup._id,
      groupName: updatedGroup.groupName,
      description: updatedGroup.description,
      policies: updatedGroup.policies,
      updatedAt: updatedGroup.updatedAt
    }));

  } catch (err) {
    console.error("Update group error:", err);
    return res.json(error("An error occurred while updating the group"));
  }
});

module.exports = router;

