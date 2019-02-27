
const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const MyNodePropNameParamRole = require('./MyNodePropNameParamRole');
const myNodeState = require('./myNodeState');


class MyNodeSectionConnector extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.SECTIONCONNECTOR);
    this.cellNumber = '';
    this.connectionType = null;

    this[MyNodePropNameParamRole.POWER] = '';
    this.equipments = [];
    this.connectors = [];
    this.lep2PsConnector = null;
  }

  recalculateState() {
    let isConnected = false;
    let isSwitchedOn = false;
    for (let i = 0; i < this.equipments.length; i += 1) {
      const equipment = this.equipments[i];
      equipment.recalculateState();
      if (equipment.nodeState === myNodeState.NODE_STATE_ON) {
        isSwitchedOn = true;
      }
    }

    if (isSwitchedOn) {
      if (this.parentNode.nodeState === myNodeState.NODE_STATE_ON) {
        isConnected = true;
      }
      if (this.lep2PsConnector) {
        if (this.lep2PsConnector.nodeState === myNodeState.NODE_STATE_ON) {
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

module.exports = MyNodeSectionConnector;

