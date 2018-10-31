
const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeConnector(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.CONNECTOR);
  this.fromNode = null;
  this.toNode = null;
}


module.exports = MyNodeConnector;

