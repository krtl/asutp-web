const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


class MyNodePSPart extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.PSPART);
    this.voltage = null;
    this.sections = [];
    this.connectors = [];
  }

  recalculateState() {
    let isPSConnected = false;
    for (let i = 0; i < this.sections.length; i += 1) {
      const section = this.sections[i];
      section.recalculateState();
      if (section.nodeState === myNodeState.NODE_STATE_ON) {
        isPSConnected = true;
      }
    }

    let newState = myNodeState.UNKNOWN;
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


module.exports = MyNodePSPart;
