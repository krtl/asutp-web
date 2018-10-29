const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeSectionSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

});

module.exports.nodeType = myNodeType.SECTION;
module.exports.CompareProps = [ ];
module.exports = mongoose.model('NodeSection', NodeSectionSchema);
