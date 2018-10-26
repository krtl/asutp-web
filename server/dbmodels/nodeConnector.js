const mongoose = require('mongoose');

const NodeConnectorSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

  fromNode: String,
  toNode: String,
});

module.exports = mongoose.model('NodeConnector', NodeConnectorSchema);
