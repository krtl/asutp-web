
const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodeSectionConnector(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.SECTIONCONNECTOR);
  this.connectionType = null;
}


module.exports = MyNodeSectionConnector;

