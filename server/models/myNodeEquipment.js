const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const MyNodePropNameParamRole = require('./MyNodePropNameParamRole');
const lastValues = require('../values/lastValues');
const myNodeState = require('./myNodeState');


class MyNodeEquiment extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.EQUIPMENT);
    this.equipmentType = null;
    this[MyNodePropNameParamRole.STATE] = '';
  }

  recalculateState() {
    let newState = myNodeState.NODE_STATE_UNKNOWN;

    if (this[MyNodePropNameParamRole.STATE] !== '') {
      const paramValue = lastValues.getLastValue(this[MyNodePropNameParamRole.STATE]);
      if (paramValue) {
        if (paramValue.value === 0) {
          newState = myNodeState.NODE_STATE_OFF;
        } else {
          newState = myNodeState.NODE_STATE_ON;
        }
      }
    }

    if (this.nodeState !== newState) {
      this.doOnStateChanged(newState);
    }
  }
}


module.exports = MyNodeEquiment;
