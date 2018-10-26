const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodePSPart(parentNode, name, caption, description) {
  MyNode.call(parentNode, name, caption, description, myNodeType.PSPART);
  this.dummyParam = null;
}


module.exports = MyNodePSPart;
