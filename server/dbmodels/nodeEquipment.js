const mongoose = require('mongoose');
const myNodeType = require('../models/myNodeType');

const NodeEquipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

  equipmentType: Number,
});

module.exports.nodeType = myNodeType.EQUIPMENT;
module.exports.CompareProps = [ ];
module.exports = mongoose.model('NodeEquipment', NodeEquipmentSchema);
