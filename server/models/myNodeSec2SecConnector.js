
const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeSec2SecConnector(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.SEC2SECCONNECTOR);
  this.cellNumber = '';
  this.fromSection = null;
  this.toSection = null;
  this.equipments = [];
}


module.exports = MyNodeSec2SecConnector;
