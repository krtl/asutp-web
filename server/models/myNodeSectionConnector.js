
const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const MyNodePropNameParamRole = require('./MyNodePropNameParamRole');

function MyNodeSectionConnector(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.SECTIONCONNECTOR);
  this.cellNumber = '';
  this.connectionType = null;

  this[MyNodePropNameParamRole.POWER] = '';
  this.equipments = [];
  this.connectors = [];
}


module.exports = MyNodeSectionConnector;

