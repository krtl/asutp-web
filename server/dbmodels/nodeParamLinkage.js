const mongoose = require('mongoose');

const NodeParamLinkageSchema = new mongoose.Schema({
  nodeName: {
    type: String,
    index: { unique: true },
  },
  paramPropName: String,
  paramPropValue: String,

});

NodeParamLinkageSchema.index({ nodeName: 1, paramPropName: 1 }, { unique: true });


module.exports = mongoose.model('NodeParamLinkage', NodeParamLinkageSchema);
