const mongoose = require("mongoose");

const ParamValueSchema = new mongoose.Schema(
  {
    param: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Param"
    },
    paramName: {
      type: String,
      required: true
      // index: true
    },
    value: Number,
    qd: {
      type: String //  ',B' + ',Z' + ',NA' +',NV'
      // enum: [ 'B', 'S', 'NV', 'NA' ],   //'B'-Blocked, 'S'-Substitution, 'NV'-Not Valid, 'NA'- Not Actual
    },
    dt: {
      type: Date,
      default: Date.now
      // index: true
    }
  },
  {
    capped: { size: 10000000000 }
  }
);

// ParamValueSchema.index({ param: 1, dt: -1 }, { unique: true });
ParamValueSchema.index({ paramName: 1, dt: -1 }, { unique: true });

module.exports = mongoose.model("ParamValue", ParamValueSchema);
