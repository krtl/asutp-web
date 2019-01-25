const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodePS(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.PS);
  this.transformers = [];
  this.psparts = [];
}

MyNodePS.prototype = Object.create(MyNode.prototype);
MyNodePS.prototype.recalculateState = () => {

  // this.nodeState

};


module.exports = MyNodePS;
