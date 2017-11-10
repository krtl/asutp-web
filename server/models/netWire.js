const mongoose = require('mongoose');

const NetWireSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  nodeIds: Array,
});


module.exports = mongoose.model('NetWire', NetWireSchema);
