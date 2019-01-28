const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');


class MyNodeLEPConnection extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.LEP);
    this.toNodeConnector = null;
  }
}

module.exports = MyNodeLEPConnection;
