const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeTransformerConnectorSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

  toConnector: String,
});

module.exports = mongoose.model('NodeTransformerConnector', NodeTransformerConnectorSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.TRANSFORMERCONNECTOR);
define('compareProps', [ 'toConnector' ]);
define('convertToObj', [ 'toConnector' ]);
