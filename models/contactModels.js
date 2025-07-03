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
  contactNumber:{
    type: String,
    default:"",
  },
  address:{
    type: String,
    default:""
  }, 
  addressTwo:{
    type: String,
    default:""
  },
  city:{
    type: String,
    default:""
  },
  country:{
    type: String,
    default:""
  },
  saas:{
    type: [String],
    default:""
  },
  hosted:{
    type: [String],
    default:""
  },
  zipcode:{
    type:Number,
    default:""
  },
  desiredDate:{
    type:Date,
    default:null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const contact = mongoose.model("contact", contactSchema);

module.exports = contact;
