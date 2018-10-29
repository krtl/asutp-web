const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeLEPSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

  voltage: Number,
});

module.exports.nodeType = myNodeType.LEP;
module.exports.CompareProps = [ 'voltage' ];
module.exports = mongoose.model('NodeLEP', NodeLEPSchema);
