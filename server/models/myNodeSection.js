const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const MyNodePropNameParamRole = require('./MyNodePropNameParamRole');
const lastValues = require('../values/lastValues');
const myNodeState = require('./myNodeState');
const MyChain = require('./myChain');


class MyNodeSection extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.SECTION);
    this[MyNodePropNameParamRole.VOLTAGE] = '';
    this.connectors = [];
    this.chain = null;
  }

  SetManualValue(manualValue) {
    // { nodeName: this.state.editedParamName, cmd: 'block', manualValue: newValue.newValue }

    if (this[MyNodePropNameParamRole.VOLTAGE] === '') {
      if (manualValue.manualValue > 0) {
        this.powered = myNodeState.POWERED_ON;
      } else {
        this.powered = myNodeState.POWERED_OFF;
      }
    } else {
      lastValues.SetManualValue({
        paramName: this[MyNodePropNameParamRole.VOLTAGE],
        cmd: manualValue.cmd,
        manualValue: manualValue.manualValue,
      });
    }
  }

  recalculatePoweredState() {
    let newPowered = myNodeState.POWERED_UNKNOWN;

    if (this[MyNodePropNameParamRole.VOLTAGE] !== '') {
      const paramValue = lastValues.getLastValue(this[MyNodePropNameParamRole.VOLTAGE]);
      if (paramValue) {
        if (paramValue.value > 0) {
          newPowered = myNodeState.POWERED_ON;
        } else {
          newPowered = myNodeState.POWERED_OFF;
        }
      } else {
        newPowered = myNodeState.POWERED_UNKNOWN;
      }

      this.kTrust = 1;

      if (this.powered !== newPowered) {
        this.doOnPoweredStateChanged(newPowered);
      }
    }
  }

  setPoweredStateForConnectors() {
    for (let i = 0; i < this.connectors.length; i += 1) {
      const connector = this.connectors[i];
      connector.setPoweredStateFromSection();
    }
  }

  makeAChain() {
    this.chain = new MyChain();
    this.chain.sections.push(this);
    for (let i = 0; i < this.connectors.length; i += 1) {
      const connector = this.connectors[i];
      if (connector.getSwitchedOn()) {
        this.chain.elements.push(connector);
      }
    }
  }
}

module.exports = MyNodeSection;
