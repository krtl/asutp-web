function MyParam(name, caption, description) {
  this.name = name;
  this.caption = caption;
  this.description = description;
  this.listNames = [];

  this.trackAllChanges = true; // temporary
  this.trackAveragePerHour = true; // temporary


  this.setListNames = (listNames) => {
    this.listNames = listNames;
  };
}

function myParamStringifyReplacer(key, value) {
  if (key === 'listNames') return undefined;
  if (key === 'trackAllChanges') return undefined;
  if (key === 'trackAveragePerHour') return undefined;
  return value;
}

const MyParamJsonSerialize = param => JSON.stringify(param, myParamStringifyReplacer);

module.exports = MyParam;
module.exports.MyParamJsonSerialize = MyParamJsonSerialize;

