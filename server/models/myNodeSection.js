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
    } else {
      let isPoweredOn = false;
      let isPoweredOff = false;
      let kTrustPoweredOn = -100;
      let kTrustPoweredOff = -100;

      const pspart = this.parentNode;
      if (pspart.inputNotOutput) {
        for (let i = 0; i < this.connectors.length; i += 1) {
          const connector = this.connectors[i];
          if (!connector.transformerConnector) {
            connector.getPoweredState();
            if (connector.powered === myNodeState.POWERED_ON) {
              if (connector.kTrust > kTrustPoweredOn) {
                kTrustPoweredOn = connector.kTrust;
              }
              isPoweredOn = true;
            } else {
              if (connector.kTrust > kTrustPoweredOff) {
                kTrustPoweredOff = connector.kTrust;
              }
              isPoweredOff = true;
            }
          }
        }
      } else {
        for (let i = 0; i < this.connectors.length; i += 1) {
          const connector = this.connectors[i];
          connector.getPoweredState();
          if (connector.powered === myNodeState.POWERED_ON) {
            if (connector.kTrust > kTrustPoweredOn) {
              kTrustPoweredOn = connector.kTrust;
            }
            isPoweredOn = true;
          } else {
            if (connector.kTrust > kTrustPoweredOff) {
              kTrustPoweredOff = connector.kTrust;
            }
            isPoweredOff = true;
          }
        }
      }

      if ((isPoweredOn) && (kTrustPoweredOn >= kTrustPoweredOff)) {
        newPowered = myNodeState.POWERED_ON;
        this.kTrust = kTrustPoweredOn - 1;
      } else if (isPoweredOff) {
        newPowered = myNodeState.POWERED_OFF;
        this.kTrust = kTrustPoweredOff - 1;
      } else {
        newPowered = myNodeState.POWERED_UNKNOWN;
        this.kTrust = -100;
      }

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
}

module.exports = MyNodeSection;
