
const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const MyNodePropNameParamRole = require('../models/MyNodePropNameParamRole');
const lastValues = require('../values/lastValues');


class MyNodeConnector extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.SEC2SECCONNECTOR);
    this.cellNumber = '';
    this.equipments = [];
    this.switchedOn = false;
  }

  SetManualValue(manualValue) {
  // { connectorName: this.state.editedParamName, cmd: 'block', manualValue: newValue.newValue }

    if (this.equipments.length === 0) {
      const float = manualValue.manualValue;
      this.switchedOn = (float !== 0);
    } else {
      for (let i = 0; i < this.equipments.length; i += 1) {
        const equipment = this.equipments[i];
        if (MyNodePropNameParamRole.STATE in equipment) {
          if (equipment[MyNodePropNameParamRole.STATE] !== '') {
            lastValues.SetManualValue({
              paramName: equipment[MyNodePropNameParamRole.STATE],
              cmd: manualValue.cmd,
              manualValue: manualValue.manualValue,
            });
            break;
          }
        }
      }
    }
  }

  IsSwitchedOn() {
    if (this.equipments.length === 0) {
      return this.switchedOn;
    }

    for (let i = 0; i < this.equipments.length; i += 1) {
      const equipment = this.equipments[i];
      if (equipment.isSwitchedOn()) {
        return true;
      }
    }
    return false;
  }
}

module.exports = MyNodeConnector;
