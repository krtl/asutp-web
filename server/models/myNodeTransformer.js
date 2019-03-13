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
        if (connector.powered === myNodeState.NODE_STATE_ON) {
          isConnected = true;
        }
      }
    }

    let newPowered = myNodeState.NODE_STATE_UNKNOWN;
    if (isConnected) {
      newPowered = myNodeState.NODE_STATE_ON;
    } else {
      newPowered = myNodeState.NODE_STATE_OFF;
    }

    if (this.powered !== newPowered) {
      this.doOnPoweredStateChanged(newPowered);
    }
  }
}

module.exports = MyNodeTransformer;
