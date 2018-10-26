const mongoose = require('mongoose');

const NodeEquipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },

  equipmentType: Number,
});

module.exports = mongoose.model('NodeEquipment', NodeEquipmentSchema);
