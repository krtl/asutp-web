const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');


class MyNodeLEP extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.LEP);
    this.voltage = null;
    this.connections = [];
  }
}


module.exports = MyNodeLEP;
