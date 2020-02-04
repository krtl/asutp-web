const myNodeState = require("./myNodeState");
// const MyChains = require('../models/myChains');
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
  this.holders = [];
  this.connectedElements = [];
  this.disconnectedElements = [];
  this.powered = myNodeState.POWERED_UNKNOWN;

  this.join = chain => {
    concatNonExisted(this.holders, chain.holders);
    concatNonExisted(this.connectedElements, chain.connectedElements);
    concatNonExisted(this.disconnectedElements, chain.disconnectedElements);

    // relinking holders
    for (let i = 0; i < this.holders.length; i += 1) {
      const holder = this.holders[i];
      holder.chain = this;
    }
  };
}

module.exports = MyChain;
