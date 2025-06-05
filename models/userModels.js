const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  userName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/
  },
  password: {
    type: String
  },
  emailVerification: {
    type: Boolean,
    default: false 
 },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const user = mongoose.model("product", userSchema);

module.exports = user;