const mongoose = require('mongoose');

const ParamListSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true }
  },
  caption: String,
  description: String,
  params: Array,
});

module.exports = mongoose.model('ParamList', ParamListSchema);
