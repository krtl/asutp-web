const mongoose = require('mongoose');

const NetNodePSSchema = new mongoose.Schema({
  id: {// the same as in netNodes
    type: String,
    index: { unique: true },
  },
  dummyParam: String,
});

module.exports = mongoose.model('NetNodePS', NetNodePSSchema);
