// models/orderModel.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "tilted_user",
    required: true
  },
  quantity:{
    type:Number,
     required: true
  },
  buyerName:{
    type:String,
     required: true
  },
  buyerEmail:{
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
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentInfo: {
    type: mongoose.Schema.Types.Mixed
  },
  status: { type: String, default: "Processing" },
  createdAt: {
     type: Date,
     default: Date.now
  }
});

module.exports = mongoose.model("order", orderSchema);
