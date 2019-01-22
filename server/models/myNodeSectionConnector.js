
const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeSectionConnector(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.SECTIONCONNECTOR);
  this.cellNumber = '';
  this.connectionType = null;
  this.paramP = '';
  this.equipments = [];
  this.connectors = [];
}


module.exports = MyNodeSectionConnector;

