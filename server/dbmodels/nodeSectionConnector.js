const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeSectionConnectorSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },
  connectionType: Number, // source, consumer, bi-directional

});

module.exports = mongoose.model('NodeSectionConnector', NodeSectionConnectorSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.SECTIONCONNECTOR);
define('compareProps', [ ]);
