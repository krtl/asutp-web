const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeRegion(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.REGION);
}


module.exports = MyNodeRegion;
