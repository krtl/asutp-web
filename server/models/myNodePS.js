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
      if (pspart.powered === myNodeState.POWERED_ON) {
        isConnected = true;
      }
    }

    // for (let i = 0; i < this.lep2psConnectors.length; i += 1) {
    //   const connector = this.lep2psConnectors[i];
    //   connector.recalculatePoweredState();
    //   if (connector.powered === myNodeState.POWERED_ON) {
    //     isConnected = true;
    //   }
    // }

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

  makeChains() {
    for (let i = 0; i < this.psparts.length; i += 1) {
      const pspart = this.psparts[i];
      pspart.makeChains();
    }

    for (let i = 0; i < this.transformers.length; i += 1) {
      const transformer = this.transformers[i];
      const connectedSections = [];

      for (let j = 0; j < transformer.transConnectors.length; j += 1) {
        const transConnector = transformer.transConnectors[j];
        if (transConnector.toConnector.switchedOn) {
          const section = transConnector.toConnector.parentNode;
          connectedSections.push(section);
        }
      }

      if (connectedSections.length > 1) {
        const {chain} = connectedSections[0];
        for (let k = 1; k < connectedSections.length; k += 1) {
          const section = connectedSections[k];
          chain.append(section.chain);
          section.chain = chain;
        }
        chain.elements.push(transformer);
      }
    }
  }
}


module.exports = MyNodePS;
