
const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const MyNodePropNameParamRole = require('./MyNodePropNameParamRole');
const lastValues = require('../values/lastValues');
const myNodeState = require('./myNodeState');


class MyNodeSectionConnector extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.SECTIONCONNECTOR);
    this.cellNumber = '';
    this.connectionType = null;

    this[MyNodePropNameParamRole.POWER] = '';
    this.equipments = [];
    this.connectors = [];
    this.lep2PsConnector = null;
    this.transformerConnector = false;
    this.switchedOn = false;
  }

  setPoweredStateFromSection() {
    let newPowered = myNodeState.POWERED_UNKNOWN;

    if (this[MyNodePropNameParamRole.POWER] !== '') {
      const paramValue = lastValues.getLastValue(this[MyNodePropNameParamRole.POWER]);
      if (paramValue) {
        if (paramValue.value > 0) {
          newPowered = myNodeState.POWERED_ON;
          this.switchedOn = true;
        } else {
          newPowered = myNodeState.POWERED_OFF;
          this.switchedOn = false;
        }
        this.kTrust = 1;
      }
    } else {
      let isSwitchedOn = false;

      for (let i = 0; i < this.equipments.length; i += 1) {
        const equipment = this.equipments[i];
        if (equipment.isSwitchedOn()) {
          isSwitchedOn = true;
        }
      }

      if (isSwitchedOn) {
        newPowered = this.parentNode.powered;
        this.kTrust = this.parentNode.kTrust;

        if (this.lep2PsConnector) {
          this.lep2PsConnector.setPoweredFromPsConnector();
        }
      } else {
        newPowered = myNodeState.POWERED_OFF;
        this.kTrust = 1;
      }
    }

    if (this.powered !== newPowered) {
      console.log('[SectionConnector] setPoweredStateFromSection');
      this.doOnPoweredStateChanged(newPowered);
    }
  }

  getPoweredState() {
    let newPowered = myNodeState.POWERED_UNKNOWN;

    if (this[MyNodePropNameParamRole.POWER] !== '') {
      const paramValue = lastValues.getLastValue(this[MyNodePropNameParamRole.POWER]);
      if (paramValue) {
        if (paramValue.value > 0) {
          newPowered = myNodeState.POWERED_ON;
          this.switchedOn = true;
        } else {
          newPowered = myNodeState.POWERED_OFF;
          this.switchedOn = false;
        }
        this.kTrust = 1;
      }
    } else {
      let isPowered = false;
      let isSwitchedOn = false;

      for (let i = 0; i < this.equipments.length; i += 1) {
        const equipment = this.equipments[i];
        if (equipment.isSwitchedOn()) {
          isSwitchedOn = true;
        }
      }

      if (isSwitchedOn) {
        if (this.transformerConnector) {
          const section = this.parentNode;
          const pspart = section.parentNode;
          const ps = pspart.parentNode;

          for (let i = 0; i < ps.transformers.length; i += 1) {
            const transformer = ps.transformers[i];
            for (let j = 0; j < transformer.transConnectors.length; j += 1) {
              const transConnector = transformer.transConnectors[j];
              if (transConnector.toConnector === this) {
                for (let k = 0; k < transformer.transConnectors.length; k += 1) {
                  if (k !== j) {
                    const transConnector1 = transformer.transConnectors[k];
                    const section1 = transConnector1.toConnector.parentNode;
                    const pspart1 = section1.parentNode;
                    if (pspart1.inputNotOutput) {
                      if (transConnector1.toConnector.powered === myNodeState.POWERED_ON) {
                        isPowered = true;
                        this.kTrust = this.lep2PsConnector.kTrust;
                      }
                      break;
                    }
                  }
                }
              }
            }
          }
        } else if (this.lep2PsConnector) {
          if (this.lep2PsConnector.kTrust > this.parentNode.kTrust) {
            if (this.lep2PsConnector.powered === myNodeState.POWERED_ON) {
              isPowered = true;
              this.kTrust = this.lep2PsConnector.kTrust;
            }
          }
        }
      }

      if (isPowered) {
        newPowered = myNodeState.POWERED_ON;
      } else {
        newPowered = myNodeState.POWERED_OFF;
      }
    }

    if (this.powered !== newPowered) {
      console.log('[SectionConnector] getPoweredState');
      this.doOnPoweredStateChanged(newPowered);
    }
  }
}

module.exports = MyNodeSectionConnector;

