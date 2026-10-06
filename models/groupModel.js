// models/Group.js
const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  groupName: { 
    type: String,
    required: true,
    unique: true 
  },
  description: {
     type: String
  },
  policies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Policy' }],
  createdAt: { type: Date, default: Date.now }
});

const group = mongoose.model('group', GroupSchema);

module.exports = group;