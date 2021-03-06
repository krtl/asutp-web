const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeLEPSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

  voltage: Number,
});


module.exports = mongoose.model('NodeLEP', NodeLEPSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.LEP);
define('compareProps', [ 'voltage' ]);
