const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeSection(parentNode, name, caption, description) {
  MyNode.call(parentNode, name, caption, description, myNodeType.SECTION);
  this.dummyParam = null;
}


module.exports = MyNodeSection;
