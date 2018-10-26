const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodePS(parentNode, name, caption, description) {
  MyNode.call(parentNode, name, caption, description, myNodeType.PS);
  this.dummyParam = null;
}


module.exports = MyNodePS;
