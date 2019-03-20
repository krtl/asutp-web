const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');


class MyNodeLEP2LEPConnection extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.LEP2LEPCONNECTION);
    this.toNode = null;
  }

  setPoweredFromLEP() {
    if (this.parentNode.kTrust >= this.kTrust) {
      this.kTrust = this.parentNode.kTrust;
      if (this.powered !== this.parentNode.powered) {
        this.doOnPoweredStateChanged(this.parentNode.powered);
      }
    }
  }

  recalculatePoweredState() {
    if (this.toNode) {
      if (this.parentNode.kTrust > this.toNode.kTrust) {
        this.kTrust = this.parentNode.kTrust;
        if (this.powered !== this.parentNode.powered) {
          this.doOnPoweredStateChanged(this.parentNode.powered);
        }
      } else if (this.parentNode.kTrust < this.toNode.kTrust) {
        this.kTrust = this.toNode.kTrust;
        if (this.powered !== this.toNode.powered) {
          this.doOnPoweredStateChanged(this.toNode.powered);
        }
      } else {
        let isConnected = false;
        if (this.toNode.powered === myNodeState.POWERED_ON) {
          isConnected = true;
        }
        if (this.parentNode.powered === myNodeState.POWERED_ON) {
          isConnected = true;
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
  }

}

module.exports = MyNodeLEP2LEPConnection;
