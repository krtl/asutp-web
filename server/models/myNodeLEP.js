const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeLEP(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.LEP);
  this.voltage = null;
}


module.exports = MyNodeLEP;