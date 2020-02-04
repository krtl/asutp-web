const myNodeType = require("./myNodeType");
const MyNode = require("./myNode");

class MyNodeRegion extends MyNode {
  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.REGION);
  }
}

module.exports = MyNodeRegion;
