const mongoose = require('mongoose');

const NetNodeSchemaSchema = new mongoose.Schema({
  schemaName: {
    type: String,
    // index: { unique: true },
  },
  nodeName: {
    type: String,
  },
  // caption: String,
  // description: String,
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },

});

NetNodeSchemaSchema.index({ schemaName: 1, nodeName: 1 }, { unique: true });


module.exports = mongoose.model('NetNodeSchema', NetNodeSchemaSchema);
