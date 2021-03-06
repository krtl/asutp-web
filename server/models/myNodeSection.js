const myNodeType = require("./myNodeType");
const MyNodeChainHolder = require("./myNodeChainHolder");
const MyNodePropNameParamRole = require("./MyNodePropNameParamRole");
const myNodeState = require("./myNodeState");
const MyChain = require("./myChain");
let lastValues = undefined;
if (process.env.RECALCULATION) {
  lastValues = require("../serviceBackground/lastValues");
}

class MyNodeSection extends MyNodeChainHolder {
  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.SECTION);
    this[MyNodePropNameParamRole.VOLTAGE] = "";
    this.connectors = [];
  }

  SetManualValue(manualValue) {
    // { nodeName: this.state.editedParamName, cmd: 'block', manualValue: newValue.newValue }
    if (process.env.RECALCULATION) {
      if (this[MyNodePropNameParamRole.VOLTAGE] === "") {
        if (manualValue.manualValue > 0) {
          this.powered = myNodeState.POWERED_ON;
        } else {
          this.powered = myNodeState.POWERED_OFF;
        }
      } else {
        lastValues.SetManualValue({
          paramName: this[MyNodePropNameParamRole.VOLTAGE],
          cmd: manualValue.cmd,
          manualValue: manualValue.manualValue
        });
      }
    }
  }

  updatePoweredState() {
    if (process.env.RECALCULATION) {
      let newPowered = myNodeState.POWERED_UNKNOWN;

      if (this[MyNodePropNameParamRole.VOLTAGE] !== "") {
        const paramValue = lastValues.getLastValue(
          this[MyNodePropNameParamRole.VOLTAGE]
        );
        if (paramValue) {
          if (paramValue.value > 0) {
            newPowered = myNodeState.POWERED_ON;
          } else {
            newPowered = myNodeState.POWERED_OFF;
          }
        } else {
          newPowered = myNodeState.POWERED_UNKNOWN;
        }

        if (this.powered !== newPowered) {
          this.doOnPoweredStateChanged(newPowered);
        }
      }
    }
  }

  makeAChain() {
    this.chain = new MyChain();
    this.chain.holders.push(this);
    for (let i = 0; i < this.connectors.length; i += 1) {
      const connector = this.connectors[i];
      if (connector.getSwitchedOn()) {
        this.chain.connectedElements.push(connector);
      } else {
        this.chain.disconnectedElements.push(connector);
      }
    }
  }
}

module.exports = MyNodeSection;
