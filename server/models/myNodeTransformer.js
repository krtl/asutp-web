const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeTransformer(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.TRANSFORMER);
  this.power = null;
}


module.exports = MyNodeTransformer;
