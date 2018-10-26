const mongoose = require('mongoose');

const NodeTransformerSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

  power: Number,
});

module.exports = mongoose.model('NodeTransformer', NodeTransformerSchema);
