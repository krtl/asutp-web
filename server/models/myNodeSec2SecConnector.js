
const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


class MyNodeSec2SecConnector extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.SEC2SECCONNECTOR);
    this.cellNumber = '';
    this.fromSection = null;
    this.toSection = null;
    this.equipments = [];
  }

  recalculateState() {
    let isConnected = false;
    for (let i = 0; i < this.equipments.length; i += 1) {
      const equipment = this.equipments[i];
      equipment.recalculateState();
      if (equipment.nodeState === myNodeState.NODE_STATE_ON) {
        isConnected = true;
      }
    }

    let newState = myNodeState.NODE_STATE_UNKNOWN;
    if (isConnected) {
      newState = myNodeState.NODE_STATE_ON;
    } else {
      newState = myNodeState.NODE_STATE_OFF;
    }

    if (this.nodeState !== newState) {
      this.doOnStateChanged(newState);
    }
  }
}

module.exports = MyNodeSec2SecConnector;
