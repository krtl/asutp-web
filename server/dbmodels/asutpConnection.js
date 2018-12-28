const mongoose = require('mongoose');

const AsutpConnectionSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },
  caption: String,
  psSapCode: String,
  voltage: String,
  connectionNumber: String,
  VVParamName: String,
  PParamName: String,
});

AsutpConnectionSchema.index({ psSapCode: 1 });

module.exports = mongoose.model('AsutpConnection', AsutpConnectionSchema);
