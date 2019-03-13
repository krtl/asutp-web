
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
    this.switchedOn = false;
  }

  recalculatePoweredState() {
    let isConnected = false;
    let isSwitchedOn = false;
    for (let i = 0; i < this.equipments.length; i += 1) {
      const equipment = this.equipments[i];
      equipment.recalculatePoweredState();
      if (equipment.powered === myNodeState.NODE_STATE_ON) {
        isSwitchedOn = true;
      }
    }

    if (isSwitchedOn) {
      if (this.fromSection.kTrust >= this.toSection.kTrust) {
        if (this.fromSection.nodeStpoweredate === myNodeState.NODE_STATE_ON) {
          isConnected = true;
        }
      } else if (this.toSection.powered === myNodeState.NODE_STATE_ON) {
        isConnected = true;
      }
    }

    let newPowered = myNodeState.NODE_STATE_UNKNOWN;
    if (isConnected) {
      newPowered = myNodeState.NODE_STATE_ON;
    } else {
      newPowered = myNodeState.NODE_STATE_OFF;
    }

    if (this.powered !== newPowered) {
      this.doOnPoweredStateChanged(newPowered);
    }
  }
}

module.exports = MyNodeSec2SecConnector;
