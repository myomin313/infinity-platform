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
  },
  score: {
    type: Number,
    min: 1,
    max: 5,
  },
  location: String,
  experience: {
    type: Number,
    min: 1,
    max: 5
  },
  ease: {
    type: Number,
    min: 1,
    max: 5
  },
  challenge: {
    type: String,
    enum: ['yes', 'no']
  },
  challengesDetails: String,
  intuitive: {
    type: String,
    enum: ['yes', 'no']
  },
  like: String,
  recommend: {
    type: Number,
    min: 1,
    max: 5
  },
  toImprove: String,
  missing: String,
  participate: {
    type: String,
    enum: ['yes', 'no']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('feedbacks', feedbackSchema);