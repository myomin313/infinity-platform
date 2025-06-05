const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  title: {
    type: String
  },
  subTitle: {
    type: String
  },
  features: {
    type: [String],
  },
  price: {
    type: Number
  },
  currency: {
    type: String,
 },
 billing:{
    type: String,
 },
 color:{
   type:String,
 },
 recommended:{
   type:Boolean
 },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const service = mongoose.model("services", serviceSchema);

module.exports = service;