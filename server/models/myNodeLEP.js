const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


class MyNodeLEP extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.LEP);
    this.voltage = null;
    this.lep2lepConnectors = [];
    this.lep2psConnectors = [];
  }

  recalculateState() {
    let isConnected = false;
    for (let i = 0; i < this.lep2lepConnectors.length; i += 1) {
      const connector = this.lep2lepConnectors[i];
      connector.recalculateState();
      if (connector.nodeState === myNodeState.NODE_STATE_ON) {
        isConnected = true;
      }
    }
    for (let i = 0; i < this.lep2psConnectors.length; i += 1) {
      const connector = this.lep2psConnectors[i];
      connector.recalculateState();
      if (connector.nodeState === myNodeState.NODE_STATE_ON) {
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


module.exports = MyNodeLEP;
