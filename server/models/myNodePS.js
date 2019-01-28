const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');
const myNodeState = require('./myNodeState');

function MyNodePS(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.PS);
  this.transformers = [];
  this.psparts = [];
}

MyNodePS.prototype = Object.create(MyNode.prototype);
MyNodePS.prototype.recalculateState = () => {
  let isPSConnected = false;
  for (let i = 0; i < this.psparts.length; i += 1) {
    const pspart = this.psparts[i];
    pspart.recalculateState();
    if (pspart.nodeState === myNodeState.ON) {
      isPSConnected = true;
    }
  }

  let newState = myNodeState.UNKNOWN;
  if (isPSConnected) {
    newState = myNodeState.ON;
  } else {
    newState = myNodeState.OFF;
  }

  if (this.nodeState !== newState) {
    this.nodeState = newState;

    // event handler here
  }
};


module.exports = MyNodePS;
