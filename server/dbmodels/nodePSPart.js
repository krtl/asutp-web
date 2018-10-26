const mongoose = require('mongoose');

const NodePSPartSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

});

module.exports = mongoose.model('NodePSPart', NodePSPartSchema);
