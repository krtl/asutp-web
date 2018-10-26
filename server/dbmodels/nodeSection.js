const mongoose = require('mongoose');

const NodeSectionSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

});

module.exports = mongoose.model('NodeSection', NodeSectionSchema);
