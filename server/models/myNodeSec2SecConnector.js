
const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeSec2SecConnector(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.PSCONNECTOR);
  this.fromSection = null;
  this.toSection = null;
}


module.exports = MyNodeSec2SecConnector;
