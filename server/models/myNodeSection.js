const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const MyNodePropNameParamRole = require('./MyNodePropNameParamRole');
const lastValues = require('../values/lastValues');
const myNodeState = require('./myNodeState');


class MyNodeSection extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.SECTION);
    this[MyNodePropNameParamRole.VOLTAGE] = '';
    this.connectors = [];
  }

  SetManualValue(manualValue) {
    // { nodeName: this.state.editedParamName, cmd: 'block', manualValue: newValue.newValue }

    if (this[MyNodePropNameParamRole.VOLTAGE] === '') {
      const float = manualValue.manualValue;
      this.powered = (float !== 0);
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
        this.kTrust = 1;

        if (this.powered !== newPowered) {
          this.doOnPoweredStateChanged(newPowered);
        }

        for (let i = 0; i < this.connectors.length; i += 1) {
          const connector = this.connectors[i];
          connector.setPoweredStateFromSection();
        }
      }
    } else {
      let isPowered = false;
      this.kTrust = -1;

      const pspart = this.parentNode;
      if (pspart.inputNotOutput) {
        for (let i = 0; i < this.connectors.length; i += 1) {
          const connector = this.connectors[i];
          if (!connector.transformerConnector) {
            connector.getPoweredState();
            if (connector.powered === myNodeState.POWERED_ON) {
              if (connector.kTrust > this.kTrust) {
                this.kTrust = connector.kTrust;
              }
              isPowered = true;
            }
          }
        }

        if (isPowered) {
          newPowered = myNodeState.POWERED_ON;
        } else {
          newPowered = myNodeState.POWERED_OFF;
        }

        if (this.powered !== newPowered) {
          this.doOnPoweredStateChanged(newPowered);
        }

        for (let i = 0; i < this.connectors.length; i += 1) {
          const connector = this.connectors[i];
          connector.setPoweredStateFromSection();
        }
      } else {
        for (let i = 0; i < this.connectors.length; i += 1) {
          const connector = this.connectors[i];
          connector.getPoweredState();
          if (connector.powered === myNodeState.POWERED_ON) {
            if (connector.kTrust > this.kTrust) {
              this.kTrust = connector.kTrust;
            }
            isPowered = true;
          }
        }

        if (isPowered) {
          newPowered = myNodeState.POWERED_ON;
        } else {
          newPowered = myNodeState.POWERED_OFF;
        }

        if (this.powered !== newPowered) {
          this.doOnPoweredStateChanged(newPowered);
        }

        for (let i = 0; i < this.connectors.length; i += 1) {
          const connector = this.connectors[i];
          connector.setPoweredStateFromSection();
        }
      }
    }
  }
}

module.exports = MyNodeSection;
