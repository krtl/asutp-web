const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeConnectorSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

  fromNode: String,
  toNode: String,
});

module.exports = mongoose.model('NodeConnector', NodeConnectorSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.CONNECTOR);
define('compareProps', [ 'fromNode', 'toNode' ]);
