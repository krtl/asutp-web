
const myNodeType = require('./myNodeType');
const MyNodeConnector = require('./myNodeConnector');

class MyNodeSec2SecConnector extends MyNodeConnector {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.SEC2SECCONNECTOR);
    this.fromSection = null;
    this.toSection = null;
  }
}

module.exports = MyNodeSec2SecConnector;
