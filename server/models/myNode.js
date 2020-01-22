const myNodeState = require('./myNodeState');

function MyNode(name, caption, description, nodeType) {
  this.name = name;
  this.caption = caption;
  this.description = description;
  this.nodeType = nodeType;
  this.parentNode = null;
  this.sapCode = '';

  this.powered = myNodeState.POWERED_UNKNOWN;
  this.doOnPoweredStateChanged = (newPowered) => {
    if (this.poweredStateChangeHandler) {
      this.poweredStateChangeHandler(this, this.powered, newPowered);
    }
    this.powered = newPowered;
  };

  this.schemaNames = [];
  this.setSchemaNames = (schemaNames) => {
    this.schemaNames = schemaNames;
  };
}

// MyNode.prototype.recalculatePoweredState = () => {

//   // this.powered

// };

function myNodeStringifyReplacer(key, value) {
  if (key === 'schemaNames') return undefined;
  if (key === 'parentNode') return undefined;
  if (key === 'description') return undefined;
  return value;
}

const MyNodeJsonSerialize = (node) => JSON.stringify(node, myNodeStringifyReplacer, 2);

module.exports = MyNode;
module.exports.MyNodeJsonSerialize = MyNodeJsonSerialize;
