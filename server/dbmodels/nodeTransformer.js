const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeTransformerSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

  power: Number,
});

module.exports.nodeType = myNodeType.TRANSFORMER;
module.exports.CompareProps = [ 'power' ];
module.exports = mongoose.model('NodeTransformer', NodeTransformerSchema);
