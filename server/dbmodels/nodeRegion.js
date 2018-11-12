const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeRegionSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

});

module.exports = mongoose.model('NodeRegion', NodeRegionSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.RES);
define('compareProps', [ ]);
