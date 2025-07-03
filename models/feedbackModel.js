// models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
 userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  selectedDescribeItems: {
    type: [String],
    enum: ['individual', 'company', 'other'],
    default:null
  },
  score: {
    type: Number,
    min: 1,
    max: 5,
    default:null
  },
  location: {
    type: String,
    default:""
  },
  experience: {
    type: Number,
    min: 1,
    max: 5,
    default:null
  },
  ease: {
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
  challengesDetails: String,
  intuitive: {
    type: String,
    enum: ['yes', 'no'],
    default:null
  },
  location: {
    type: String,
    default:""
  },
  recommend: {
    type: Number,
    min: 1,
    max: 5,
    default:null
  },
  toImprove: {
    type: String,
    default:""
  },
  missing: {
    type: String,
    default:""
  },
  participate: {
    type: String,
    enum: ['yes', 'no'],
    default:null
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('feedbacks', feedbackSchema);