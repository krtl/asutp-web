const mongoose = require('mongoose');

const NetNodeSectionSchema = new mongoose.Schema({
  name: {// the same as in netNodes
    type: String,
    index: { unique: true },
  },
  dummyParam: String,
});

module.exports = mongoose.model('NetNodeSection', NetNodeSectionSchema);
