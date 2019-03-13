const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


class MyNodePS extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.PS);
    this.transformers = [];
    this.psparts = [];
    this.lep2psConnectors = [];
  }

  recalculatePoweredState() {
    let isConnected = false;
    for (let i = 0; i < this.psparts.length; i += 1) {
      const pspart = this.psparts[i];
      pspart.recalculatePoweredState();
      if (pspart.powered === myNodeState.NODE_STATE_ON) {
        isConnected = true;
      }
    }

    // for (let i = 0; i < this.lep2psConnectors.length; i += 1) {
    //   const connector = this.lep2psConnectors[i];
    //   connector.recalculatePoweredState();
    //   if (connector.powered === myNodeState.NODE_STATE_ON) {
    //     isConnected = true;
    //   }
    // }

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


module.exports = MyNodePS;
