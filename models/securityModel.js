const mongoose = require("mongoose");

const securityServiceSchema = new mongoose.Schema({
  modelType: {
    type: String,
    required: true,
    unique: true
  },
  pricePerMonth: {
    type: String,
    required: true
  },
  hundredEmployees: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("security", securityServiceSchema);