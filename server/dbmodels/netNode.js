const mongoose = require('mongoose');

const NetNodeSchema = new mongoose.Schema({
  id: {
    type: String,
    index: { unique: true },
  },
  name: String,
  caption: String,
  description: String,
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
  nodeType: {           // 0 - unknown, 1-ps, 2-section, 3-transformer, 4-cell, ....
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('NetNode', NetNodeSchema);
