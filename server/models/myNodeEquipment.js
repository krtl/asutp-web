const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const MyNodePropNameParamRole = require('./MyNodePropNameParamRole');
const lastValues = require('../values/lastValues');
const myNodeState = require('./myNodeState');


function MyNodeEquiment(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.EQUIPMENT);
  this.equipmentType = null;
  this[MyNodePropNameParamRole.STATE] = '';
}

MyNodeEquiment.prototype = Object.create(MyNode.prototype);
MyNodeEquiment.prototype.recalculateState = () => {
  if (this[MyNodePropNameParamRole.STATE] !== '') {
    const paramValue = lastValues.getLastValue(this[MyNodePropNameParamRole.STATE]);
    if (paramValue) {
      let newState = myNodeState.UNKNOWN;
      if (paramValue.value === 0) {
        newState = myNodeState.ON;
      } else {
        newState = myNodeState.OFF;
      }

      if (this.nodeState !== newState) {
        this.nodeState = newState;

        // event handler here
      }
    }
  }
};


module.exports = MyNodeEquiment;
