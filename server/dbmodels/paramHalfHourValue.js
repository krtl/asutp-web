const mongoose = require('mongoose');

const ParamHalfHourValueSchema = new mongoose.Schema({
  param: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Param"
  },
  paramName: {
    type: String,
    required: true,
    // index: true,
  },
  value: Number,
  qd: {
    type: String,
    enum: [ 'B', 'S', 'NV', 'NA' ],   //'B'-Blocked, 'S'-Substitution, 'NV'-Not Valid, 'NA'- Not Actual
  },
  dt: {
    type: Date,
    default: Date.now,
    // index: true,
  },
});

ParamHalfHourValueSchema.index({ param: 1, dt: -1 }, { unique: true });
ParamHalfHourValueSchema.index({ paramName: 1, dt: -1 }, { unique: true });


module.exports = mongoose.model('ParamHalfHourValue', ParamHalfHourValueSchema);
