const mongoose = require('mongoose');

const NetWireSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true,
  },
  nodeFrom: string,
  nodeTo: string,
});


module.exports = mongoose.model('NetWire', NetWireSchema);
