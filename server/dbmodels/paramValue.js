const mongoose = require('mongoose');

const ParamValueSchema = new mongoose.Schema({
  paramName: {
    type: String,
    required: true
  },
  value: String,
  qd:{
    type: String,
    enum: ['B', 'S', 'NV', 'NA'],   //'B'-Blocked, 'S'-Substitution, 'NV'-Not Valid, 'NA'- Not Actual
  },
  dt: {
    type: Date,
    default: Date.now
  },
});


module.exports = mongoose.model('ParamValue', ParamValueSchema);
