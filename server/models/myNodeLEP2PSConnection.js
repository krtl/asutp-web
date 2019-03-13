const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


class MyNodeLEP2PSConnection extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.LEP2PSCONNECTION);
    this.toNodeConnector = null;
  }

  recalculatePoweredState() {
    let isConnected = false;
    if (this.toNodeConnector) {
      this.toNodeConnector.recalculatePoweredState();
      if (this.toNodeConnector.powered === myNodeState.NODE_STATE_ON) {
        isConnected = true;
      }
      if (this.parentNode.powered === myNodeState.NODE_STATE_ON) {
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

module.exports = MyNodeLEP2PSConnection;
