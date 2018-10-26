const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeEquiment(parentNode, name, caption, description) {
  MyNode.call(parentNode, name, caption, description, myNodeType.EQUIPMENT);
  this.equipmentType = null;
}


module.exports = MyNodeEquiment;
