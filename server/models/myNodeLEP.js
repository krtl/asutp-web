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

  recalculatePoweredState() {
    let isConnected = false;
    for (let i = 0; i < this.lep2lepConnectors.length; i += 1) {
      const connector = this.lep2lepConnectors[i];
      connector.recalculatePoweredState();
      if (connector.powered === myNodeState.POWERED_ON) {
        isConnected = true;
      }
    }
    for (let i = 0; i < this.lep2psConnectors.length; i += 1) {
      const connector = this.lep2psConnectors[i];
      connector.recalculatePoweredState();
      if (connector.powered === myNodeState.POWERED_ON) {
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


module.exports = MyNodeLEP;
