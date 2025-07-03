// models/Feedback.js
const mongoose = require('mongoose');

const recoveryfeedbackSchema = new mongoose.Schema({
  accountId:{
    type: String,
  },
  age:{
    type: Number, 
  },
  gender: String,
  experience: {
    type: Number,
    min: 1,
    max: 5,
    default:null
  },
  goal: {
    type: Number,
    min: 1,
    max: 5,
    default:null
  },
  challenge: {
    type: String,
    enum: ['yes', 'no'],
    default:null
  },
  challengeDetail: String,
   intuitive: {
    type: Number,
    min: 1,
    max: 5,
    default:null
  },
  lookingFor: {
    type: String,
    enum: ['yes', 'no'],
    default:null
  },
  searchingFor: String,
  feel: String,
  like: String,
  recommend: {
    type: Number,
    min: 1,
    max: 10,
    default:null
  },
  toImprove:String,
  missing:String,
  participate: {
    type: String,
    enum: ['yes', 'no'],
    default:null,
    required: false,
  },
  selectedDescribeItems: {
    type: [String],
    enum: ['customer', 'visitor', 'first-time user','other'],
    default:null
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('recovery-feedbacks', recoveryfeedbackSchema);