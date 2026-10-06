const mongoose = require("mongoose");

const policySchema = new mongoose.Schema({
  policyName: {
    type: String,
    required:true,
    unique: true
  },
  description: {
    type: String,
    required:true,
    default:null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const policy = mongoose.model("policy", policySchema);

module.exports = policy;