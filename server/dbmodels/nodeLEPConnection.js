const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeLEPConnectionSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

  toNode: String,
  toNodeConnector: String,

});


module.exports = mongoose.model('NodeLEPConnection', NodeLEPConnectionSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.LEPCONNECTION);
define('compareProps', [ 'toNode', 'toNodeConnector' ]);
define('convertToObj', [ 'toNode', 'toNodeConnector' ]);
