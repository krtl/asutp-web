const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


class MyNodePS extends MyNode {
  // transformers = [];
  // psparts = [];

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.PS);
    this.transformers = [];
    this.psparts = [];
  }

  recalculateState() {
    let isPSConnected = false;
    for (let i = 0; i < this.psparts.length; i += 1) {
      const pspart = this.psparts[i];
      pspart.recalculateState();
      if (pspart.nodeState === myNodeState.NODE_STATE_ON) {
        isPSConnected = true;
      }
    }

    let newState = myNodeState.NODE_STATE_UNKNOWN;
    if (isPSConnected) {
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
