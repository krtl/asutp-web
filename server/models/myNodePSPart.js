const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const MyChains = require('../models/myChains');

class MyNodePSPart extends MyNode {
  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.PSPART);
    this.voltage = null;
    this.inputNotOutput = false;
    this.sections = [];
    this.sec2secConnectors = [];
  }

  makeChains() {
    const chains = [];

    for (let i = 0; i < this.sections.length; i += 1) {
      const section = this.sections[i];
      section.makeAChain();
      section.updatePoweredState();
    }

    // Sec2Sec connectors
    for (let i = 0; i < this.sec2secConnectors.length; i += 1) {
      const sec2secConnector = this.sec2secConnectors[i];
      if ((sec2secConnector.fromSection !== null) && (sec2secConnector.toSection !== null)) {
        if ((sec2secConnector.getSwitchedOn() && (MyChains.HoldersCouldBeConnected(sec2secConnector.fromSection.chain.holders.concat(sec2secConnector.toSection.chain.holders))))) {
          // if (sec2secConnector.switchedOn) {
          sec2secConnector.fromSection.chain.connectedElements.push(sec2secConnector);
          sec2secConnector.fromSection.chain.join(sec2secConnector.toSection.chain);
        } else {
          sec2secConnector.fromSection.chain.disconnectedElements.push(sec2secConnector);
        }
      }
    }
    return chains;
  }
}


module.exports = MyNodePSPart;
