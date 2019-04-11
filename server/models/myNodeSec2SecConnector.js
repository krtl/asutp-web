
const myNodeType = require('./myNodeType');
const MyNodeConnector = require('./myNodeConnector');
const myNodeState = require('./myNodeState');


class MyNodeSec2SecConnector extends MyNodeConnector {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.SEC2SECCONNECTOR);
    this.fromSection = null;
    this.toSection = null;
  }

  recalculatePoweredState() {
    let isPowered = false;

    if (this.getSwitchedOn()) {
      this.kTrust = (this.fromSection.kTrust > this.toSection.kTrust) ? this.fromSection.kTrust - 1 : this.toSection.kTrust - 1;

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
