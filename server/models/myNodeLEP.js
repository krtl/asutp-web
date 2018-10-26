const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeLEP(parentNode, name, caption, description) {
  MyNode.call(parentNode, name, caption, description, myNodeType.LEP);
  this.voltage = null;
}


module.exports = MyNodeLEP;
