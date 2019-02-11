const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeLEP2PSConnectionSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

  toNodeConnector: String,

});


module.exports = mongoose.model('NodeLEP2PSConnection', NodeLEP2PSConnectionSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.LEP2PSCONNECTION);
define('compareProps', [ 'toNodeConnector' ]);
define('convertToObj', [ 'toNodeConnector' ]);
