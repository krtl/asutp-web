
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
    let isPowered = false;
    let isSwitchedOn = false;

    if (this.equipments.length === 0) {
      isSwitchedOn = true;  // by default we considering that connector is switched ON
    } else {
      for (let i = 0; i < this.equipments.length; i += 1) {
        const equipment = this.equipments[i];
        if (equipment.isSwitchedOn()) {
          isSwitchedOn = true;
        }
      }
    }

    if (isSwitchedOn) {
      if (this.fromSection.powered === myNodeState.POWERED_ON) {
        isPowered = true;
      } else if (this.toSection.powered === myNodeState.POWERED_ON) {
        isPowered = true;
      }
    }

    let newPowered = myNodeState.POWERED_UNKNOWN;
    if (isPowered) {
      newPowered = myNodeState.POWERED_ON;
    } else {
      newPowered = myNodeState.POWERED_OFF;
    }

    if (this.powered !== newPowered) {
      this.doOnPoweredStateChanged(newPowered);
    }
  }
}

module.exports = MyNodeSec2SecConnector;
