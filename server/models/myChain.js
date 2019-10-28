const myNodeState = require('./myNodeState');
// const MyNode = require('./myNode');

function MyChain() {
  this.sections = [];
  this.connectedElements = [];
  this.disconnectedElements = [];
  this.powered = myNodeState.POWERED_UNKNOWN;

  this.append = (chain) => {
    this.sections = this.sections.concat(chain.sections);
    this.connectedElements = this.connectedElements.concat(chain.connectedElements);
    this.disconnectedElements = this.disconnectedElements.concat(chain.disconnectedElements);
  };
}

module.exports = MyChain;
