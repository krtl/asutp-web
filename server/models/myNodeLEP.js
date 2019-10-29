const myNodeType = require('./myNodeType');
const MyNodeChainHolder = require('./myNodeChainHolder');
const MyChain = require('./myChain');


class MyNodeLEP extends MyNodeChainHolder {
  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.LEP);
    this.voltage = null;
    this.lep2lepConnectors = [];
    this.lep2psConnectors = [];
  }

  makeChains() {
    this.chain = null;
    const connectedSections = [];

    for (let i = 0; i < this.lep2psConnectors.length; i += 1) {
      const connector = this.lep2psConnectors[i];
      if (connector.toNodeConnector.switchedOn) {
        const section = connector.toNodeConnector.parentNode;
        connectedSections.push(section);
      }
    }

    if (connectedSections.length > 0) {
      this.chain = connectedSections[0].chain;
      if (this.chain.holders.indexOf(this) < 0) {
        this.chain.holders.push(this);
      }

      if (connectedSections.length > 1) {
        for (let k = 1; k < connectedSections.length; k += 1) {
          const section = connectedSections[k];
          this.chain.join(section.chain);
        }
      }
    }

    // this is for setting powering to unknown.
    if (this.chain === null) {
      this.chain = new MyChain();
      this.chain.holders.push(this);
    }


    // lep2lep connectors should be processed externaly
  }
}


module.exports = MyNodeLEP;
