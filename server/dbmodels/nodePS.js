const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodePSSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

});

module.exports = mongoose.model('NodePS', NodePSSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.PS);
define('compareProps', [ ]);
