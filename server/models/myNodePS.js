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

  recalculateState() {
    let isConnected = false;
    for (let i = 0; i < this.psparts.length; i += 1) {
      const pspart = this.psparts[i];
      pspart.recalculateState();
      if (pspart.nodeState === myNodeState.NODE_STATE_ON) {
        isConnected = true;
      }
    }

    // for (let i = 0; i < this.lep2psConnectors.length; i += 1) {
    //   const connector = this.lep2psConnectors[i];
    //   connector.recalculateState();
    //   if (connector.nodeState === myNodeState.NODE_STATE_ON) {
    //     isConnected = true;
    //   }
    // }

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


module.exports = MyNodePS;
