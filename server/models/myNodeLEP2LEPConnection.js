const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


class MyNodeLEP2LEPConnection extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.LEP2LEPCONNECTION);
    this.toNode = null;
  }

  recalculatePoweredState() {
    if (this.toNode) {
      if (this.parentNode.kTrust > this.toNode.kTrust) {
        this.kTrust = this.parentNode.kTrust - 1;
        if (this.powered !== this.parentNode.powered) {
          this.doOnPoweredStateChanged(this.parentNode.powered);
        }
      } else if (this.parentNode.kTrust < this.toNode.kTrust) {
        this.kTrust = this.toNode.kTrust - 1;
        if (this.powered !== this.toNode.powered) {
          this.doOnPoweredStateChanged(this.toNode.powered);
        }
      } else if ((this.toNode.powered === myNodeState.POWERED_ON) || (this.parentNode.powered === myNodeState.POWERED_ON)) {
        if (this.powered !== myNodeState.POWERED_ON) {
          this.doOnPoweredStateChanged(myNodeState.POWERED_ON);
        }
      } else if ((this.toNode.powered === myNodeState.POWERED_OFF) || (this.parentNode.powered === myNodeState.POWERED_OFF)) {
        if (this.powered !== myNodeState.POWERED_OFF) {
          this.doOnPoweredStateChanged(myNodeState.POWERED_OFF);
        }
      } else if (this.powered !== myNodeState.POWERED_UNKNOWN) {
        this.doOnPoweredStateChanged(myNodeState.POWERED_UNKNOWN);
      }
    }
  }

}

module.exports = MyNodeLEP2LEPConnection;
