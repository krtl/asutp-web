const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },
  caption: String,
  description: String,
  parentNode: String,
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
  sapCode: String,
  tag: Number,

});


module.exports = mongoose.model('Node', NodeSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.UNKNOWN);
define('compareProps', [ 'caption', 'description', 'parentNode', 'nodeType' ]);
