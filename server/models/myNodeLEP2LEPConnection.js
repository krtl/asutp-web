const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');


class MyNodeLEP2LEPConnection extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.LEP2LEPCONNECTION);
    this.toNode = null;
  }
}

module.exports = MyNodeLEP2LEPConnection;
