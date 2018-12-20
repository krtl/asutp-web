const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeSec2SecConnectorSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },
  fromSection: String,
  toSection: String,

});

module.exports = mongoose.model('NodeSec2SecConnector', NodeSec2SecConnectorSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.SEC2SECCONNECTOR);
define('compareProps', [ 'fromSection', 'toSection' ]);
define('convertToObj', [ 'fromSection', 'toSection' ]);
