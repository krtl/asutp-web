const mongoose = require("mongoose");

const NodeSwitchedOnStateValueSchema = new mongoose.Schema(
  {
    connectorName: {
      type: String,
      required: true,
      index: true
    },
    oldState: Boolean,
    newState: Boolean,
    dt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    capped: { size: 5000000000 }
  }
);

NodeSwitchedOnStateValueSchema.index(
  { connectorName: 1, dt: -1 },
  { unique: true }
);

module.exports = mongoose.model(
  "NodeSwitchedOnStateValue",
  NodeSwitchedOnStateValueSchema
);
