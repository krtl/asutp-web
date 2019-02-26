function MyNodeSchema(name, caption, description, nodes, paramNames) {
  this.name = name;
  this.caption = caption;
  this.description = description;
  this.nodes = nodes;
  this.paramNames = paramNames;
}

module.exports = MyNodeSchema;
