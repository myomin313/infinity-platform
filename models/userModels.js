const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  userName: {
    type: String,
    unique: true,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  startDate:{
    type:Date,
    default:"",
  },
  expireDate:{
    type:Date,
    default:"",  
  },
  lastLogin:{
    type:Date,
    default: Date.now,  
  },
  accountType:{
    type:String,
    required:true,
  },
  accountLimitation:{
    type:String,
    required:true,
  },
  role:{
    type:String,
    required:true
  },
  enabled:{
    type:Boolean,
    default:false,
  },
  endpoint:{
    type:Boolean,
    default:false,
  },
  weather:{
    type:Boolean,
    default:false,
  },
  map:{
    type:Boolean,
    default:false,
  },
  analytics:{
    type:Boolean,
    default:false,
  },
  report:{
    type:Boolean,
    default:false,
  },
  alert:{
    type:Boolean,
    default:false,
  },
  allowedUnmanaged:{
    type:Boolean,
    default:false,
  },
  devSecOps:{
    type:Boolean,
    default:false,
  },
  devOps:{
    type:Boolean,
    default:false,
  },
  soc:{
    type:Boolean,
    default:false,
  },
  sourceCode:{
    type:Boolean,
    default:false,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const user = mongoose.model("user", userSchema);

module.exports = user;