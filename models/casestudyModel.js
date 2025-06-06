const mongoose = require("mongoose");

const casestudySchema = new mongoose.Schema({
  title: {
    type: String
  },
  description: {
    type: String
  },
  industry: {
    type: String,
  },
  logoUrl: {
    type: String
  },
  clientName: {
    type: String,
 },
 country:{
    type: String,
 },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const caseStudy = mongoose.model("case_study", casestudySchema);

module.exports = caseStudy;