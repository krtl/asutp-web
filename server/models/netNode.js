const mongoose = require('mongoose');

const options = { discriminatorKey: 'kind' };

const NetNodeSchema = new mongoose.Schema({
  id: {
    type: String,
    index: { unique: true },
  },
  name: String,
  caption: String,
  description: String,
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
}, options);

const netNode = mongoose.model('NetNode', NetNodeSchema);
module.exports = netNode;

const netNodeSwitch = netNode.discriminator('NetNodeSwitch',
  new mongoose.Schema({
    paramOnOffState: String,
    // ..
  }, options));
module.exports = netNodeSwitch;


const netNodeTransformer = netNode.discriminator('NetNodeTransformer',
  new mongoose.Schema({
    testPower: String,
    // ..
  }, options));
module.exports = netNodeTransformer;


const netNodeCell = netNode.discriminator('NetNodeCell',
  new mongoose.Schema({
    paramOnOffState: String,
    // ..
  }, options));
module.exports = netNodeCell;

