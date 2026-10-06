const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema({
  permissionName: {
    type: String,
    required:true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const permission = mongoose.model("permission", permissionSchema);

module.exports = permission;