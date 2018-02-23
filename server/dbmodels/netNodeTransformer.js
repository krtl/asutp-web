const mongoose = require('mongoose');

const NetNodeTransformerSchema = new mongoose.Schema({
  id: {// the same as in netNodes
    type: String,
    index: { unique: true },
  },
  dummyParam: String,
});

module.exports = mongoose.model('NetNodeTransformer', NetNodeTransformerSchema);
