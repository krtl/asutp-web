const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodePSPartSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

});

module.exports = mongoose.model('NodePSPart', NodePSPartSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.PSPART);
define('compareProps', [ ]);
