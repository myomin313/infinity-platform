const mongoose = require('mongoose');

const recoverySchema = new mongoose.Schema({
  email: { type: String, required: true },
  issueType: { type: String, enum: ['Lost Two Factor Authentication', 'Lost Access To Email', 'Forget Email'], required: true },
  status: { type: String, default: 'Pending' },
  requestedAt: { type: Date, default: Date.now },
  accountId: {
    type: String,
  },
 additionalDetails: {
    type: String,
    trim: true
  },
  file_names: {  // Changed to store just original names as array
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('RecoveryRequest', recoverySchema);
