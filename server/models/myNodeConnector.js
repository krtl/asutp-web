
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

    this.doOnSwitchedOnStateChanged = (newSwitchedOn) => {
      if (this.switchedOnStateChangeHandler) {
        this.switchedOnStateChangeHandler(this, this.switchedOn, newSwitchedOn);
      }
      this.switchedOn = newSwitchedOn;
    };
  }


  SetManualValue(manualValue) {
  // { nodeName: this.state.editedParamName, cmd: 'block', manualValue: newValue.newValue }

    if (this.equipments.length === 0) {
      const float = manualValue.manualValue;
      const newSwitchedOn = (float !== 0);
      if (this.switchedOn !== newSwitchedOn) {
        this.doOnSwitchedOnStateChanged(newSwitchedOn);
      }
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

  getSwitchedOn() {
    if (this.equipments.length > 0) {
      let newSwitchedOn = this.switchedOn;

      for (let i = 0; i < this.equipments.length; i += 1) {
        const equipment = this.equipments[i];
        if (equipment.isConnectionSwitch()) {
          newSwitchedOn = equipment.isSwitchedOn();
          break;
        }
      }

      if (this.switchedOn !== newSwitchedOn) {
        this.doOnSwitchedOnStateChanged(newSwitchedOn);
      }
    }

    return this.switchedOn;
  }
}

module.exports = MyNodeConnector;
