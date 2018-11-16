
const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodePSConnector(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.PSCONNECTOR);
  this.fromSection = null;
  this.toSection = null;
}


module.exports = MyNodePSConnector;
