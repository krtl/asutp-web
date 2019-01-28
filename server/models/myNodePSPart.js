const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


function MyNodePSPart(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.PSPART);
  this.voltage = null;
  this.sections = [];
  this.connectors = [];
}


MyNodePSPart.prototype = Object.create(MyNode.prototype);
MyNodePSPart.prototype.recalculateState = () => {
  let isPSConnected = false;
  for (let i = 0; i < this.sections.length; i += 1) {
    const section = this.sections[i];
    section.recalculateState();
    if (section.nodeState === myNodeState.ON) {
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


module.exports = MyNodePSPart;
