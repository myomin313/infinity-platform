// models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  toDo: {
    type: String,
    required: true
  },
  toBring: {
    type: String,
  },
  offer: {
    type: String,
  },
  requisitionId:{
    type:Number
  },
  workArea:{
    type:String,
    required: true
  },
  careerStatus:{
    type:String
  },
  employmentType:{
    type:String
  },
  expectedTravel:{
    type:String
  },
  location:{
    type:String
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Job', jobSchema);
