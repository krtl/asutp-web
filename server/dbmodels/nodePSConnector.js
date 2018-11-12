const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodePSConnectorSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

});

module.exports = mongoose.model('NodePSConnector', NodePSConnectorSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.PSCONNECTOR);
define('compareProps', [ ]);
