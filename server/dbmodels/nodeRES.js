const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeRESSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

});

module.exports.nodeType = myNodeType.RES;
module.exports.CompareProps = [ ];
module.exports = mongoose.model('NodeRES', NodeRESSchema);
