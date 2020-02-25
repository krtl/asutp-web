function MyParam(name, caption, description, trackAllChanges, trackAveragePerHour) {
  this.name = name;
  this.caption = caption;
  this.description = description;
  this.schemaNames = []; // currently only PS schemas

  this.trackAllChanges = trackAllChanges;
  this.trackAveragePerHour = trackAveragePerHour;

  this.setSchemaNames = schemaNames => {
    this.schemaNames = schemaNames;
  };
}

function myParamStringifyReplacer(key, value) {
  if (key === "schemaNames") return undefined;
  if (key === "trackAllChanges") return undefined;
  if (key === "trackAveragePerHour") return undefined;
  return value;
}

const MyParamJsonSerialize = param =>
  JSON.stringify(param, myParamStringifyReplacer);

module.exports = MyParam;
module.exports.MyParamJsonSerialize = MyParamJsonSerialize;
