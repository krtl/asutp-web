const mongoose = require('mongoose');

const ShutDownSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  fromDt: {
    type: Date,
  },
  toDt: {
    type: Date,
  },
});


module.exports = mongoose.model('ShutDown', ShutDownSchema);
