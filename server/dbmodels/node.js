const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },
  caption: String,
  description: String,
  parentNode: {
    type: String,
    index: true,
  },
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
    index: true,
  },
  sapCode: {
    type: String,
    index: true,
    // index: { unique: true }, //this key prevent importing in case if node changed name but remained the SapCode.
  },
  tag: {
    type: Number,
    index: true,
  },

});

NodeSchema.index({ parentNode: 1, nodeType: 1 });

module.exports = mongoose.model('Node', NodeSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.UNKNOWN);
define('compareProps', [ 'caption', 'description', 'parentNode', 'nodeType' ]);
