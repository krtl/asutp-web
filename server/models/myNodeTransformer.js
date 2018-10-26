const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeTransformer(parentNode, name, caption, description) {
  MyNode.call(parentNode, name, caption, description, myNodeType.TRANSFORMER);
  this.dummyParam = null;
}


module.exports = MyNodeTransformer;
