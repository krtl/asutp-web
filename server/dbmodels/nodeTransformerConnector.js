const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeTransformerConnectorSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

  toSection: String,
});

module.exports = mongoose.model('NodeTransformerConnector', NodeTransformerConnectorSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.TRANSFORMERCONNECTOR);
define('compareProps', [ 'toSection' ]);
