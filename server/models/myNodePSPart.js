const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


class MyNodePSPart extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.PSPART);
    this.voltage = null;
    this.inputNotOutput = false;
    this.sections = [];
    this.sec2secConnectors = [];
  }

  recalculatePoweredState() {
    let isConnected = false;
    for (let i = 0; i < this.sections.length; i += 1) {
      const section = this.sections[i];
      section.recalculatePoweredState();
      if (section.powered === myNodeState.NODE_STATE_ON) {
        isConnected = true;
      }
    }

    let newPowered = myNodeState.UNKNOWN;
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


module.exports = MyNodePSPart;
