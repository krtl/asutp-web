const mongoose = require('mongoose');

const NetWireSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  nodeFrom: String,
  nodeTo: String,
});


module.exports = mongoose.model('NetWire', NetWireSchema);
