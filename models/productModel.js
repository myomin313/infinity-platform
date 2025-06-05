const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
   name: {
    type: String,
    default: ""
  },
  tab: {
    type: String,
    trim: true,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const product = mongoose.model("product", ProductSchema);

module.exports = product;
