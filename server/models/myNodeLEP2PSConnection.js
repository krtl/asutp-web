const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const MyNodePropNameParamRole = require('./MyNodePropNameParamRole');
// const myNodeState = require('./myNodeState');


class MyNodeLEP2PSConnection extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.LEP2PSCONNECTION);
    this.toNodeConnector = null;
  }

  setPoweredFromPsConnector() {
    this.kTrust = this.toNodeConnector.kTrust - 1;
    if (this.powered !== this.toNodeConnector.powered) {
      this.doOnPoweredStateChanged(this.toNodeConnector.powered);
    }
  }

  setPoweredFromLEP() {
    const section = this.toNodeConnector.parentNode;
    if (section[MyNodePropNameParamRole.VOLTAGE] === '') {
      if (this.kTrust <= this.parentNode.kTrust) {
        this.kTrust = this.parentNode.kTrust - 1;
        if (this.powered !== this.parentNode.powered) {
          this.doOnPoweredStateChanged(this.parentNode.powered);
        }
      }
    }
  }

}

module.exports = MyNodeLEP2PSConnection;
