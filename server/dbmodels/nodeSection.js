const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeSectionSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },
});

module.exports = mongoose.model('NodeSection', NodeSectionSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.SECTION);
define('compareProps', [ ]);
