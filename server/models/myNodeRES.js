const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeRES(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.RES);
}


module.exports = MyNodeRES;
