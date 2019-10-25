const myNodeState = require('./myNodeState');
// const MyNode = require('./myNode');

function MyChain() {
    this.sections = [];
    this.elements = [];
    this.powered = myNodeState.POWERED_UNKNOWN;

    this.append = (chain) => {
        this.sections.push(chain.sections);
        this.elements.push(chain.elements);
      };    
  }

  module.exports = MyChain;
