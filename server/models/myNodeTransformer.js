const myNodeType = require("./myNodeType");
const MyNode = require("./myNode");

class MyNodeTransformer extends MyNode {
  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.TRANSFORMER);
    this.power = null;
    this.transConnectors = [];
  }
}

module.exports = MyNodeTransformer;
