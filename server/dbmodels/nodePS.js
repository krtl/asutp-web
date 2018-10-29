const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodePSSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

});

module.exports.nodeType = myNodeType.PS;
module.exports.CompareProps = [ ];
module.exports = mongoose.model('NodePS', NodePSSchema);
