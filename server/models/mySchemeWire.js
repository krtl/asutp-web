const myNodeState = require('./myNodeState');

function MySchemeWire(name, caption, description, nodeType) {
  this.name = name;
  this.caption = caption;
  this.description = description;
  this.nodeType = nodeType;

  this.powered = myNodeState.POWERED_UNKNOWN;
  this.parentNode = undefined;
  // this.description = undefined;
}


function myWireStringifyReplacer(key, value) {
  if (key === 'parentNode') return undefined;
  if (key === 'description') return undefined;
  return value;
}

const MyWireJsonSerialize = node => JSON.stringify(node, myWireStringifyReplacer, 2);

module.exports = MySchemeWire;
module.exports.MyWireJsonSerialize = MyWireJsonSerialize;
