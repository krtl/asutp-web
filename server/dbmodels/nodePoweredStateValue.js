const mongoose = require("mongoose");

const NodePoweredStateValueSchema = new mongoose.Schema(
  {
    nodeName: {
      type: String,
      required: true
      // index: true
    },
    oldState: Number, // Unknown, On, Off, Alarm
    newState: Number, // Unknown, On, Off, Alarm
    dt: {
      type: Date,
      default: Date.now
      // index: true
    }
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "AuthUser"
    // }
  },
  // {
  //   capped: { size: 5000000000 }
  // }
);

NodePoweredStateValueSchema.index({ nodeName: 1, dt: -1 }, { unique: true });

module.exports = mongoose.model(
  "NodePoweredStateValue",
  NodePoweredStateValueSchema
);
