const mongoose = require('mongoose');

// obsolete. Currently not used.

const NetNodeSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },
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
  nodeType: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('NetNode', NetNodeSchema);
