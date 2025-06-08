const mongoose = require("mongoose");

const studycaseSchema = new mongoose.Schema({
  title: {
    type: String,
    required:true,
  },
  tags: {
    type: [String],
  },
  fileName: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const studyCase = mongoose.model("study_case", studycaseSchema);

module.exports = studyCase;