const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodePSPartSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

});

module.exports.nodeType = myNodeType.PSPART;
module.exports.CompareProps = [ ];
module.exports = mongoose.model('NodePSPart', NodePSPartSchema);
