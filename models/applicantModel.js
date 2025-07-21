const mongoose = require("mongoose");

const applicantModelSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "jobs",
    required: true
  },
  salutation: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ""
  },
  firstName: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  surnameTitle: {
    type: String,
  },
  country: {
    type: String,
    required: true
  },
  postcode: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  house: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  telephone: {
    type: String,
    required: true
  },
  authorizedToWork: {
    type: String,
    required: true
  },
  file_url: [{ type: String }],
  fileDescription: [{ type: String }],
  requiredVisa: {
    type: String,
    required: true
  },
  accessPersonalData: {
    type: String,
    required: true
  },
  currentWorkingOstGroup: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
const applicant = mongoose.model("applicant", applicantModelSchema);

module.exports = applicant;
