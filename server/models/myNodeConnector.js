
const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeConnector(parentNode, name, caption, description) {
  MyNode.call(parentNode, name, caption, description, myNodeType.CONNECTOR);
  this.fromNode = null;
  this.toNode = null;
}


module.exports = MyNodeConnector;

