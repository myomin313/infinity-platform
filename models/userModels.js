const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  contactNumber:{
    type:String,
    required:true,
  },
  companyRegistrationNumber:{
     type:String,
    required:true, 
  },
  companySize:{
    type:String,
  },
  level:{
  type:String,
  enum: ["founder", "cto", "developer", "product","other","Procurement Manager","User"],  
  },
  address1:{
    type:String,
    required:true,
  },
  address2:{
    type:String,
  },
  city:{
    type:String,
    required:true,
  },
  country:{
    type:String, 
    required:true,
  },
  verificationCode: String,
  verificationCodeExpires: Date,
  desiredStartDate:{
    type: Date,
    default: Date.now
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
  },
  startDate:{
    type:Date,
    default:"",
  },
  isVerified: {
    type: Boolean,
    default: false
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
  },
  accountLimitation:{
    type:String,
  },
  role:{
    type:String,
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
  deleted: {
  type: Boolean,
  default: false,
 },
 enabled: {
  type: Boolean,
  default: false,
 },
 resetPasswordToken:String,
 resetPasswordExpire: Date,
 suspended: {
  type: Boolean,
  default: false,
},
createdAt: {
    type: Date,
    default: Date.now
}
});

const user = mongoose.model("user", userSchema);

module.exports = user;