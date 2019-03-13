
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

  recalculatePoweredState() {
    let newPowered = myNodeState.NODE_STATE_UNKNOWN;

    if (this[MyNodePropNameParamRole.POWER] !== '') {
      const paramValue = lastValues.getLastValue(this[MyNodePropNameParamRole.POWER]);
      if (paramValue) {
        if (paramValue.value > 0) {
          newPowered = myNodeState.NODE_STATE_ON;
        } else {
          newPowered = myNodeState.NODE_STATE_OFF;
        }
        this.kTrust = 1;

        for (let i = 0; i < this.equipments.length; i += 1) {
          const equipment = this.equipments[i];
          equipment.recalculatePoweredState();
        }
      }
    } else {
      let isConnected = false;
      let isSwitchedOn = false;

      for (let i = 0; i < this.equipments.length; i += 1) {
        const equipment = this.equipments[i];
        equipment.recalculatePoweredState();
        if (equipment.powered === myNodeState.NODE_STATE_ON) {
          isSwitchedOn = true;
        }
      }

      if (isSwitchedOn) {
        if (this.parentNode.powered === myNodeState.NODE_STATE_ON) {
          isConnected = true;
          this.kTrust = this.parentNode.kTrust;
        }
        if (this.lep2PsConnector) {
          if (this.lep2PsConnector.kTrust > this.parentNode.kTrust) {
            if (this.lep2PsConnector.powered === myNodeState.NODE_STATE_ON) {
              isConnected = true;
              this.kTrust = this.lep2PsConnector.kTrust;
            }
          }
        }
      }

      if (isConnected) {
        newPowered = myNodeState.NODE_STATE_ON;
      } else {
        newPowered = myNodeState.NODE_STATE_OFF;
      }
    }

    if (this.powered !== newPowered) {
      this.doOnPoweredStateChanged(newPowered);
    }
  }
}

module.exports = MyNodeSectionConnector;

