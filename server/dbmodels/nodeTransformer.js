const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeTransformerSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

  power: Number,
});

module.exports = mongoose.model('NodeTransformer', NodeTransformerSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.TRANSFORMER);
define('compareProps', [ 'power' ]);
