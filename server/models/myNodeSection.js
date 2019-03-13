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

      const pspart = this.parentNode;
      if (pspart.inputNotOutput) {
        this.kTrust = -1;
        for (let i = 0; i < this.connectors.length; i += 1) {
          const connector = this.connectors[i];
          if (!connector.transformerConnector) {
            connector.recalculateState();
            if (connector.nodeState === myNodeState.NODE_STATE_ON) {
              if (connector.kTrust > this.kTrust) {
                this.kTrust = connector.kTrust;
              }
              isConnected = true;
            }
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

        for (let i = 0; i < this.connectors.length; i += 1) {
          const connector = this.connectors[i];
          if (connector.transformerConnector) {
            connector.recalculateState();
          }
        }
      } else {
        let transformerConnected = false;
        for (let i = 0; i < this.connectors.length; i += 1) {
          const connector = this.connectors[i];
          if (connector.transformerConnector) {
            connector.recalculateState();
            if (connector.connected) {
              // const isInTransformerConnector = (ps, con) => {
              //   for (let i = 0; i < ps.transformers.length; i += 1) {
              //     const transformer = ps.transformers[i];
              //     for (let j = 0; j < transformer.transConnectors.length; j += 1) {
              //       const connector = transformer.transConnectors[j];
              //       if (connector.toConnector === con) {
              //         return true;
              //       }
              //     }
              //   }
              //   return false;
              // };

              transformerConnected = true;
              break;
            }
          }
        }

        if (transformerConnected) {
          const ps = pspart.parentNode;
          for (let i = 0; i < ps.psparts.length; i += 1) {
            const locPsPart = ps.psparts[i];
            if (locPsPart.inputNotOutput) {
              break;
            }
          }
        }

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
        for (let i = 0; i < this.parentNode.sec2secConnectors.length; i += 1) {
          const sec2secConnector = this.parentNode.sec2secConnectors[i];
          sec2secConnector.recalculateState();
          if (sec2secConnector.nodeState === myNodeState.NODE_STATE_ON) {
            if (sec2secConnector.kTrust > this.kTrust) {
              this.kTrust = sec2secConnector.kTrust;
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
}

module.exports = MyNodeSection;
