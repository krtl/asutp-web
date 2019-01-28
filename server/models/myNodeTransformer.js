const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


function MyNodeTransformer(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.TRANSFORMER);
  this.power = null;
  this.connectors = [];
}

MyNodeTransformer.prototype = Object.create(MyNode.prototype);
MyNodeTransformer.prototype.recalculateState = () => {
  let isPSConnected = false;
  for (let i = 0; i < this.connectors.length; i += 1) {
    const connector = this.connectors[i].toConnector;
    if (connector) {
      // connector.recalculateState();  // connector should be allready recalculated
      if (connector.nodeState === myNodeState.ON) {
        isPSConnected = true;
      }
    }
  }

  let newState = myNodeState.UNKNOWN;
  if (isPSConnected) {
    newState = myNodeState.ON;
  } else {
    newState = myNodeState.OFF;
  }

  if (this.nodeState !== newState) {
    this.nodeState = newState;

    // event handler here
  }
};

module.exports = MyNodeTransformer;
