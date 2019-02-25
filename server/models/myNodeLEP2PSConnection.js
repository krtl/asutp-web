const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


class MyNodeLEP2PSConnection extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.LEP2PSCONNECTION);
    this.toNodeConnector = null;
  }

  recalculateState() {
    let isConnected = false;
    if (this.toNodeConnector) {
      this.toNodeConnector.recalculateState();
      if (this.toNodeConnector.nodeState === myNodeState.NODE_STATE_ON) {
        isConnected = true;
      }
      if (this.parentNode.nodeState === myNodeState.NODE_STATE_ON) {
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

module.exports = MyNodeLEP2PSConnection;
