const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');
const MyNodePropNameParamRole = require('./MyNodePropNameParamRole');


class MyNodePSPart extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.PSPART);
    this.voltage = null;
    this.inputNotOutput = false;
    this.sections = [];
    this.sec2secConnectors = [];
  }

  recalculatePoweredState() {
    let isPowered = false;
    for (let i = 0; i < this.sections.length; i += 1) {
      const section = this.sections[i];
      section.recalculatePoweredState();    // w/o sec2sec connectors
      section.setPoweredStateForConnectors();
    }

      // Sec2Sec connectors
    for (let i = 0; i < this.sec2secConnectors.length; i += 1) {
      const sec2secConnector = this.sec2secConnectors[i];
      sec2secConnector.recalculatePoweredState();
      if (sec2secConnector.switchedOn) {
          // connect sections throught ses2sec connector
        for (let j = 0; j < this.sections.length; j += 1) {
          const section = this.sections[j];
          if ((sec2secConnector.fromSection === section) || (sec2secConnector.toSection === section)) {
            if (section[MyNodePropNameParamRole.VOLTAGE] === '') {
              if (section.kTrust <= sec2secConnector.kTrust) {
                section.kTrust = sec2secConnector.kTrust - 1;
                if (sec2secConnector.powered !== section.powered) {
                  section.doOnPoweredStateChanged(sec2secConnector.powered);
                  section.setPoweredStateForConnectors();
                }
              }
            }
          }
        }
      }
    }


    for (let i = 0; i < this.sections.length; i += 1) {
      const section = this.sections[i];
      if (section.powered === myNodeState.POWERED_ON) {
        isPowered = true;
      }
    }
    let newPowered = myNodeState.UNKNOWN;
    if (isPowered) {
      newPowered = myNodeState.POWERED_ON;
    } else {
      newPowered = myNodeState.POWERED_OFF;
    }

    if (this.powered !== newPowered) {
      this.doOnPoweredStateChanged(newPowered);
    }
  }

  makeChains() {
    const chains = [];

    for (let i = 0; i < this.sections.length; i += 1) {
      const section = this.sections[i];
      section.makeAChan();
    }

      // Sec2Sec connectors
    for (let i = 0; i < this.sec2secConnectors.length; i += 1) {
      const sec2secConnector = this.sec2secConnectors[i];
      if (sec2secConnector.switchedOn) {
          if ((sec2secConnector.fromSection !== null) && (sec2secConnector.toSection !== null)) {
            sec2secConnector.fromSection.chain.append(sec2secConnector.toSection.chain);
            sec2secConnector.toSection.chain = sec2secConnector.fromSection.chain;
            sec2secConnector.fromSection.chain.elements.push(sec2secConnector);
          }
        }        
      }
      return chains;
  }
}


module.exports = MyNodePSPart;
