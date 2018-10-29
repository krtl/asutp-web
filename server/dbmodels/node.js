const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },
  parentNode: String,
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
  sapCode: String,
});


module.exports.nodeType = myNodeType.UNKNOWN;
module.exports.CompareProps = [ 'caption', 'description', 'nodeType' ];
module.exports = mongoose.model('Node', NodeSchema);
