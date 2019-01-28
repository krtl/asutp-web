const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


class MyNodeSection extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.SECTION);
    this.connectors = [];
  }

  recalculateState() {
    let isPSConnected = false;
    for (let i = 0; i < this.connectors.length; i += 1) {
      const connector = this.connectors[i];
      connector.recalculateState();
      if (connector.nodeState === myNodeState.NODE_STATE_ON) {
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

module.exports = MyNodeSection;
