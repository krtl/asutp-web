const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
// const myNodeState = require('./myNodeState');


class MyNodeLEP2PSConnection extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.LEP2PSCONNECTION);
    this.toNodeConnector = null;
  }

  setPoweredFromPsConnector() {
    if (this.toNodeConnector.kTrust >= this.kTrust) {
      this.kTrust = this.toNodeConnector.kTrust;
      if (this.powered !== this.toNodeConnector.powered) {
        this.doOnPoweredStateChanged(this.toNodeConnector.powered);
      }
    }
  }

  setPoweredFromLEP() {
    if (this.parentNode.kTrust >= this.kTrust) {
      this.kTrust = this.parentNode.kTrust;
      if (this.powered !== this.parentNode.powered) {
        this.doOnPoweredStateChanged(this.parentNode.powered);
      }
    }
  }

}

module.exports = MyNodeLEP2PSConnection;
