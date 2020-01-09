const mongoose = require('mongoose');

const BlockedParamSchema = new mongoose.Schema({
  name: {
    type: String,
    index: { unique: true },
  },
  dt: {
    type: Date,
    default: Date.now,
  },  
  user: String,
});

module.exports = mongoose.model('blockedParam', BlockedParamSchema);