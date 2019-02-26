const myNodeState = require('./myNodeState');

function MyNode(name, caption, description, nodeType) {
  this.name = name;
  this.caption = caption;
  this.description = description;
  this.nodeType = nodeType;
  this.parentNode = null;
  this.sapCode = '';

  this.nodeState = myNodeState.NODE_STATE_UNKNOWN;
  this.doOnStateChanged = (newState) => {
    if (this.stateChangeHandler) {
      this.stateChangeHandler(this, this.nodeState, newState);
    }
    this.nodeState = newState;
  };

  this.schemaNames = [];
  this.setSchemaNames = (schemaNames) => {
    this.schemaNames = schemaNames;
  };
}

MyNode.prototype.recalculateState = () => {

  // this.nodeState

};

function myNodeStringifyReplacer(key, value) {
  if (key === 'parentNode') return undefined;
  if (key === 'description') return undefined;
  return value;
}

const MyNodeJsonSerialize = node => JSON.stringify(node, myNodeStringifyReplacer, 2);

module.exports = MyNode;
module.exports.MyNodeJsonSerialize = MyNodeJsonSerialize;

