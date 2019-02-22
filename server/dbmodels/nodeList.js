const mongoose = require('mongoose');

const NodeListSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },
  caption: String,
  description: String,
  nodeNames: String,
});

module.exports = mongoose.model('NodeList', NodeListSchema);
