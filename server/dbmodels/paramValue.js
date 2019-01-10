const mongoose = require('mongoose');

const ParamValueSchema = new mongoose.Schema({
  paramName: {
    type: String,
    required: true,
    index: true,
  },
  value: Number,
  qd: {
    type: String,
    enum: [ 'B', 'S', 'NV', 'NA' ],   //'B'-Blocked, 'S'-Substitution, 'NV'-Not Valid, 'NA'- Not Actual
  },
  dt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

ParamValueSchema.index({ paramName: 1, dt: -1 }, { unique: true });


module.exports = mongoose.model('ParamValue', ParamValueSchema);
