// models/orderModel.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "services",
    required: true
  },
  quantity:{
    type:Number,
     required: true
  },
  customerName:{
    type:String,
     required: true
  },
  customerEmail:{
    type:String,
     required: true
  },
  address:{
    type:String,
    required: true
  },
  city:{
    type:String,
    required: true
  },
  country:{
    type:String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "USD"
  },
  status: {
    type: String,
    enum: ["Pending", "Paid", "Failed", "Refunded"],
    default: "Pending"
  },
  status: { type: String, default: "Processing" },
  createdAt: {
     type: Date,
     default: Date.now
  }
});

module.exports = mongoose.model("order", orderSchema);
