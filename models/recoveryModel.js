const mongoose = require('mongoose');

const recoverySchema = new mongoose.Schema({
  email: { type: String, required: true },
  issueType: { type: String, enum: ['lost-2fa', 'lost-email', 'forgot-email'], required: true },
  status: { type: String, default: 'Pending' },
  requestedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('RecoveryRequest', recoverySchema);
