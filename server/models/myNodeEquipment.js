const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeEquiment(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.EQUIPMENT);
  this.equipmentType = null;
  this.paramState = '';
}


module.exports = MyNodeEquiment;
