const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


class MyNodeTransformer extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.TRANSFORMER);
    this.power = null;
    this.connectors = [];
  }

  recalculateState() {
    let isConnected = false;
    for (let i = 0; i < this.connectors.length; i += 1) {
      const connector = this.connectors[i].toConnector;
      if (connector) {
      // connector.recalculateState();  // connector should be allready recalculated
        if (connector.nodeState === myNodeState.NODE_STATE_ON) {
          isConnected = true;
        }
      }
    }

    let newState = myNodeState.NODE_STATE_UNKNOWN;
    if (isConnected) {
      newState = myNodeState.NODE_STATE_ON;
    } else {
      newState = myNodeState.NODE_STATE_OFF;
    }

    if (this.nodeState !== newState) {
      this.doOnStateChanged(newState);
    }
  }
}

module.exports = MyNodeTransformer;
