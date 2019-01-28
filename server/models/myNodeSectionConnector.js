
const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const MyNodePropNameParamRole = require('./MyNodePropNameParamRole');
const myNodeState = require('./myNodeState');


function MyNodeSectionConnector(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.SECTIONCONNECTOR);
  this.cellNumber = '';
  this.connectionType = null;

  this[MyNodePropNameParamRole.POWER] = '';
  this.equipments = [];
  this.connectors = [];
}


MyNodeSectionConnector.prototype = Object.create(MyNode.prototype);
MyNodeSectionConnector.prototype.recalculateState = () => {
  let isPSConnected = false;
  for (let i = 0; i < this.equipments.length; i += 1) {
    const equipment = this.equipments[i];
    equipment.recalculateState();
    if (equipment.nodeState === myNodeState.ON) {
      isPSConnected = true;
    }
  }

  let newState = myNodeState.UNKNOWN;
  if (isPSConnected) {
    newState = myNodeState.ON;
  } else {
    newState = myNodeState.OFF;
  }

  if (this.nodeState !== newState) {
    this.nodeState = newState;

    // event handler here
  }
};

module.exports = MyNodeSectionConnector;

