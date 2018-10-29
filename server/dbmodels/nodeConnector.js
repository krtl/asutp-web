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

module.exports.nodeType = myNodeType.CONNECTOR;
module.exports.CompareProps = [ 'fromNode', 'toNode' ];
module.exports = mongoose.model('NodeConnector', NodeConnectorSchema);
