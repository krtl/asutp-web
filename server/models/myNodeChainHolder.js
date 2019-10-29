
const MyNode = require('./myNode');

class MyNodeChainHolder extends MyNode {
  constructor(name, caption, description, nodeType) {
    super(name, caption, description, nodeType);
    this.chain = null;
  }
}

module.exports = MyNodeChainHolder;
