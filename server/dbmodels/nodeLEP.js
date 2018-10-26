const mongoose = require('mongoose');

const NodeLEPSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

  voltage: Number,
});

module.exports = mongoose.model('NodeLEP', NodeLEPSchema);
