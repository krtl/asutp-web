const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeLEP2LEPConnectionSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

  toNode: String,

});


module.exports = mongoose.model('NodeLEP2LEPConnection', NodeLEP2LEPConnectionSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.LEP2LEPCONNECTION);
define('compareProps', [ 'toNode' ]);
define('convertToObj', [ 'toNode' ]);
