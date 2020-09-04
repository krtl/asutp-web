const mongoose = require("mongoose");

const BlockedParamSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true }
  },
  dt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AuthUser"
  }
});

module.exports = mongoose.model("BlockedParam", BlockedParamSchema);
