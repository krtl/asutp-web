const myNodeType = require("./myNodeType");
const MyNode = require("./myNode");

class MyNodeTransformerConnector extends MyNode {
  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.TRANSFORMERCONNECTOR);
    this.toConnector = null;
  }
}

module.exports = MyNodeTransformerConnector;
