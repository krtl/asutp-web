const mongoose = require('mongoose');

const NetNodeCellSchema = new mongoose.Schema({
  id: {// the same as in netNodes
    type: String,
    index: { unique: true },
  },
  paramOnOffState: String,
});

module.exports = mongoose.model('NetNodeCell', NetNodeCellSchema);
