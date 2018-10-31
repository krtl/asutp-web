const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeTransformerConnector(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.TRANSFORMERCONNECTOR);
  this.toSection = null;
}


module.exports = MyNodeTransformerConnector;
