const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeSection(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.SECTION);
}


module.exports = MyNodeSection;
