const mongoose = require('mongoose');

const NodeSchemaSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },
  caption: String,
  description: String,
  nodeNames: String,
  paramNames: String,
});

module.exports = mongoose.model('NodeSchema', NodeSchemaSchema);
