const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');


class MyNodePS extends MyNode {
  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.PS);
    this.transformers = [];
    this.psparts = [];
    this.lep2psConnectors = [];
  }

  makeChains() {
    for (let i = 0; i < this.psparts.length; i += 1) {
      const pspart = this.psparts[i];
      pspart.makeChains();
    }

    for (let i = 0; i < this.transformers.length; i += 1) {
      const transformer = this.transformers[i];
      const connectedSections = [];
      const disconnectedSections = [];

      for (let j = 0; j < transformer.transConnectors.length; j += 1) {
        const transConnector = transformer.transConnectors[j];
        if (transConnector.toConnector.switchedOn) {
          const section = transConnector.toConnector.parentNode;
          connectedSections.push(section);
        } else {
          const section = transConnector.toConnector.parentNode;
          disconnectedSections.push(section);
        }
      }

      if (connectedSections.length > 1) {
        const section1 = connectedSections[0];
        const { chain } = section1;
        for (let k = 1; k < connectedSections.length; k += 1) {
          const section2 = connectedSections[k];
          chain.join(section2.chain);
        }
        chain.connectedElements.push(transformer);
      } else if (connectedSections.length === 1) {
        const { chain } = connectedSections[0];
        chain.disconnectedElements.push(transformer);
      } else if (disconnectedSections.length > 0) {
        const { chain } = disconnectedSections[0];
        chain.disconnectedElements.push(transformer);
      }
    }
  }
}


module.exports = MyNodePS;
