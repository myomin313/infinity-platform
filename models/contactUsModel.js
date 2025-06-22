const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
   name: {
    type: String,
    required:true,
    default: ""
  },
  email: {
    type: String,
    required:true,
    trim: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/
  },
  company: {
    type: String,
    required:true,
    default: ""
  },
  phone:{
    type: String,
    default:"",
  },
  product:{
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const contact = mongoose.model("contact-us", contactSchema);

module.exports = contact;
