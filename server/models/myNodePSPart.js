const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodePSPart(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.PSPART);
  this.sections = [];
  this.connectors = [];
}


module.exports = MyNodePSPart;
