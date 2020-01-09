const mongoose = require("mongoose");

const NodePoweredStateValueSchema = new mongoose.Schema({
  nodeName: {
    type: String,
    required: true,
    index: true
  },
  oldState: Number, // Unknown, On, Off, Alarm
  newState: Number, // Unknown, On, Off, Alarm
  dt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

NodePoweredStateValueSchema.index({ nodeName: 1, dt: -1 }, { unique: true });

module.exports = mongoose.model(
  "NodePoweredStateValue",
  NodePoweredStateValueSchema
);
