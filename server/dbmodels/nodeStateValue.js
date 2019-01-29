const mongoose = require('mongoose');

const NodeStateValueSchema = new mongoose.Schema({
  nodeName: {
    type: String,
    required: true,
    index: true,
  },
  oldValue: Number,      // Unknown, On, Off, Alarm
  newValue: Number,      // Unknown, On, Off, Alarm
  dt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

NodeStateValueSchema.index({ nodeName: 1, dt: -1 }, { unique: true });


module.exports = mongoose.model('NodeStateValue', NodeStateValueSchema);
