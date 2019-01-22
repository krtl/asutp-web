const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeEquipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

  equipmentType: Number,
  paramState: String,   // On/Off
});

module.exports = mongoose.model('NodeEquipment', NodeEquipmentSchema);

function define(name, value) {
  Object.defineProperty(module.exports, name, {
    value,
    enumerable: true,
  });
}

define('nodeType', myNodeType.EQUIPMENT);
define('compareProps', [ ]);

