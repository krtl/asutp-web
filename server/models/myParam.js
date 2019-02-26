function MyParam(name, caption, description) {
  this.name = name;
  this.caption = caption;
  this.description = description;
  this.schemaNames = [];

  this.trackAllChanges = true; // temporary
  this.trackAveragePerHour = true; // temporary

  this.stateVarOf = undefined;

  this.setSchemaNames = (schemaNames) => {
    this.schemaNames = schemaNames;
  };
}

function myParamStringifyReplacer(key, value) {
  if (key === 'stateVarOf') return undefined;
  if (key === 'schemaNames') return undefined;
  if (key === 'trackAllChanges') return undefined;
  if (key === 'trackAveragePerHour') return undefined;
  return value;
}

const MyParamJsonSerialize = param => JSON.stringify(param, myParamStringifyReplacer);

module.exports = MyParam;
module.exports.MyParamJsonSerialize = MyParamJsonSerialize;

