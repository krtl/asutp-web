/* eslint-disable class-methods-use-this */
const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const MyNodePropNameParamRole = require('./MyNodePropNameParamRole');
const lastValues = require('../values/lastValues');


class MyNodeEquiment extends MyNode {
  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.EQUIPMENT);
    this.equipmentType = null;
    this[MyNodePropNameParamRole.STATE] = '';
  }

  isConnectionSwitch() {
    return (this[MyNodePropNameParamRole.STATE] !== '');
  }

  isSwitchedOn() {
    if (this[MyNodePropNameParamRole.STATE] !== '') {
      const paramValue = lastValues.getLastValue(this[MyNodePropNameParamRole.STATE]);
      if (paramValue) {
        return (paramValue.value !== 0);
      }
    } else {
      // console.log('state param does not assigned to the eqiuipment!');
    }

    return false;
  }
}


module.exports = MyNodeEquiment;
