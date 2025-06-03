const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
   name: {
    type: String,
    default: ""
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/
  },
  message: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const contact = mongoose.model("contact", contactSchema);

module.exports = contact;
