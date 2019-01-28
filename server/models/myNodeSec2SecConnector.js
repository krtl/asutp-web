
const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


function MyNodeSec2SecConnector(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.SEC2SECCONNECTOR);
  this.cellNumber = '';
  this.fromSection = null;
  this.toSection = null;
  this.equipments = [];
}


MyNodeSec2SecConnector.prototype = Object.create(MyNode.prototype);
MyNodeSec2SecConnector.prototype.recalculateState = () => {
  let isPSConnected = false;
  for (let i = 0; i < this.equipments.length; i += 1) {
    const equipment = this.equipments[i];
    equipment.recalculateState();
    if (equipment.nodeState === myNodeState.ON) {
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

module.exports = MyNodeSec2SecConnector;
