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
  userId:{
    type:String,
     required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["Processing", "Paid", "Failed", "Refunded"],
    default: "Processing"
  },
   currency: {
    type: String,
    default: "USD"
  },
  chargeId: {
    type: String
  },
  placedAt: {
     type: Date,
     default: Date.now
  },
  createdAt: {
     type: Date,
     default: Date.now
  }
});

module.exports = mongoose.model("order", orderSchema);
