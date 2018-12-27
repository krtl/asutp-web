const mongoose = require('mongoose');

const AsutpConnectionSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },
  caption: String,
  psSapCoded: String,
  voltage: String,
  connectionNumber: String,
  VVParamName: String,
  PParamName: String,
});

module.exports = mongoose.model('AsutpConnection', AsutpConnectionSchema);
