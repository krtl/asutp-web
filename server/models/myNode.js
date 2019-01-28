const myNodeState = require('./myNodeState');

function MyNode(name, caption, description, nodeType) {
  this.name = name;
  this.caption = caption;
  this.description = description;
  this.nodeType = nodeType;
  this.parentNode = null;
  this.sapCode = '';

  this.nodeState = myNodeState.UNKNOWN;
  this.doOnStateChanged = (node, oldState, newState) => {
    if (this.stateChangeHandler) {
      this.stateChangeHandler(node, oldState, newState);
    }
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

