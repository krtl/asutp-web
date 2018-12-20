function MyNode(name, caption, description, nodeType) {
  this.name = name;
  this.caption = caption;
  this.description = description;
  this.nodeType = nodeType;
  this.parentNode = null;
  this.sapCode = '';
}

function myNodeStringifyReplacer(key, value) {
//  if (key === 'x') return undefined;
//  if (key === 'y') return undefined;
  if (key === 'parentNode') return undefined;
  return value;
}

const MyNodeJsonSerialize = node => JSON.stringify(node, myNodeStringifyReplacer, 2);

module.exports = MyNode;
module.exports.MyNodeJsonSerialize = MyNodeJsonSerialize;

