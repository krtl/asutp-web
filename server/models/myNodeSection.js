const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


function MyNodeSection(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.SECTION);
  this.connectors = [];
}


MyNodeSection.prototype = Object.create(MyNode.prototype);
MyNodeSection.prototype.recalculateState = () => {
  let isPSConnected = false;
  for (let i = 0; i < this.connectors.length; i += 1) {
    const connector = this.connectors[i];
    connector.recalculateState();
    if (connector.nodeState === myNodeState.ON) {
      isPSConnected = true;
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

module.exports = MyNodeSection;
