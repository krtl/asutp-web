const myNodeType = require('./myNodeType');
const MyNode = require('./myNode');

function MyNodePS(name, caption, description) {
  MyNode.call(this, name, caption, description, myNodeType.PS);
  this.transformers = [];
  this.sections = [];
}


module.exports = MyNodePS;
