const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeRES(parentNode, name, caption, description) {
  MyNode.call(parentNode, name, caption, description, myNodeType.RES);
}


module.exports = MyNodeRES;
