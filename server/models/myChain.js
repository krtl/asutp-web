const myNodeState = require('./myNodeState');
// const MyNode = require('./myNode');

function concatNonExisted(array1, array2) {
  for (let i = 0; i < array2.length; i += 1) {
    const element = array2[i];
    if (array1.indexOf(element) < 0) {
      array1.push(element);
    }
  }
}

function MyChain() {
  this.sections = [];
  this.connectedElements = [];
  this.disconnectedElements = [];
  this.powered = myNodeState.POWERED_UNKNOWN;

  this.append = (chain) => {
    concatNonExisted(this.sections, chain.sections);
    concatNonExisted(this.connectedElements, chain.connectedElements);
    concatNonExisted(this.disconnectedElements, chain.disconnectedElements);
  };
}

module.exports = MyChain;
