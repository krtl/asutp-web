const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


class MyNodeTransformer extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.TRANSFORMER);
    this.power = null;
    this.transConnectors = [];
  }

  recalculatePoweredState() {
    let isConnected = false;
    for (let i = 0; i < this.transConnectors.length; i += 1) {
      const connector = this.transConnectors[i].toConnector;
      if (connector) {
      // connector.recalculatePoweredState();  // connector should be allready recalculated
        if (connector.powered === myNodeState.POWERED_ON) {
          isConnected = true;
        }
      }
    }

    let newPowered = myNodeState.POWERED_UNKNOWN;
    if (isConnected) {
      newPowered = myNodeState.POWERED_ON;
    } else {
      newPowered = myNodeState.POWERED_OFF;
    }

    if (this.powered !== newPowered) {
      this.doOnPoweredStateChanged(newPowered);
    }
  }
}

module.exports = MyNodeTransformer;
