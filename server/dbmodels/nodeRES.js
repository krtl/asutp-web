const mongoose = require('mongoose');

const NodeRESSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

});

module.exports = mongoose.model('NodeRES', NodeRESSchema);
