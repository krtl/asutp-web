function MyNode(name, caption, description, nodeType) {
  this.name = name;
  this.caption = caption;
  this.description = description;
  this.x = 0;
  this.y = 0;
  this.nodeType = nodeType;
  this.parentNode = null;
  this.nodes = [];
  this.sapCode = '';
}

function myNodeStringifyReplacer(key, value) {
  if (key === 'x') return undefined;
  if (key === 'y') return undefined;
  return value;
}

const MyNodeJsonSerialize = node => JSON.stringify(node, myNodeStringifyReplacer);

module.exports = MyNode;
module.exports.MyNodeJsonSerialize = MyNodeJsonSerialize;

