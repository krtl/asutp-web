const mongoose = require('mongoose');

const NodePSSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

});

module.exports = mongoose.model('NodePS', NodePSSchema);
