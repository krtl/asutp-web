
const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodePSConnector(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.PSCONNECTOR);
  this.fromNode = null;
  this.toNode = null;
}


module.exports = MyNodePSConnector;
