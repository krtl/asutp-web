const mongoose = require('mongoose');

const ParamSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true }
  },
  caption: String,
  description: String,
  type: String,
});

module.exports = mongoose.model('Param', ParamSchema);
