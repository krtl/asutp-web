const mongoose = require('mongoose');

const NodeStateSchema = new mongoose.Schema({
  nodeName: {
    type: String,
    required: true,
    index: true,
  },
  value: Number,
  dt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

NodeStateSchema.index({ nodeName: 1, dt: -1 }, { unique: true });


module.exports = mongoose.model('NodeState', NodeStateSchema);
