const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');


class MyNodeLEP2PSConnection extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.LEP2PSCONNECTION);
    this.toNodeConnector = null;
  }
}

module.exports = MyNodeLEP2PSConnection;
