const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const MyNodePropNameParamRole = require('./MyNodePropNameParamRole');
const lastValues = require('../values/lastValues');
const myNodeState = require('./myNodeState');


class MyNodeSection extends MyNode {

  constructor(name, caption, description) {
    super(name, caption, description, myNodeType.SECTION);
    this[MyNodePropNameParamRole.VOLTAGE] = '';
    this.connectors = [];
  }

  recalculateState() {
    let newState = myNodeState.NODE_STATE_UNKNOWN;

    if (this[MyNodePropNameParamRole.VOLTAGE] !== '') {
      const paramValue = lastValues.getLastValue(this[MyNodePropNameParamRole.VOLTAGE]);
      if (paramValue) {
        if (paramValue.value > 0) {
          newState = myNodeState.NODE_STATE_ON;
        } else {
          newState = myNodeState.NODE_STATE_OFF;
        }
        this.kTrust = 1;

        if (this.nodeState !== newState) {
          this.doOnStateChanged(newState);
        }

        for (let i = 0; i < this.connectors.length; i += 1) {
          const connector = this.connectors[i];
          connector.recalculateState();
        }
      }
    } else {
      let isConnected = false;
      for (let i = 0; i < this.connectors.length; i += 1) {
        const connector = this.connectors[i];
        connector.recalculateState();
        this.kTrust = -1;
        if (connector.nodeState === myNodeState.NODE_STATE_ON) {
          if (connector.kTrust > this.kTrust) {
            this.kTrust = connector.kTrust;
          }
          isConnected = true;
        }
      }

      // Sec2Sec connectors
      for (let i = 0; i < this.parentNode.connectors.length; i += 1) {
        const connector = this.parentNode.connectors[i];
        connector.recalculateState();
        if (connector.nodeState === myNodeState.NODE_STATE_ON) {
          if (connector.kTrust > this.kTrust) {
            this.kTrust = connector.kTrust;
          }
          isConnected = true;
        }
      }

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
}

module.exports = MyNodeSection;
