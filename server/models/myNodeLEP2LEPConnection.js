const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


class MyNodeLEP2LEPConnection extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.LEP2LEPCONNECTION);
    this.toNode = null;
  }

  recalculatePoweredState() {
    let isConnected = false;
    if (this.toNode) {
      // this.toNode.recalculatePoweredState();
      if (this.toNode.powered === myNodeState.POWERED_ON) {
        isConnected = true;
      }
      if (this.parentNode.powered === myNodeState.POWERED_ON) {
        isConnected = true;
      }
    }

    let newPowered = myNodeState.POWERED_UNKNOWN;
    if (isConnected) {
      newPowered = myNodeState.POWERED_ON;
    } else {
      newPowered = myNodeState.POWERED_OFF;
    }

    if (this.powered !== newPowered) {
      this.doOnPoweredStateChanged(newPowered);
    }
  }

}

module.exports = MyNodeLEP2LEPConnection;
