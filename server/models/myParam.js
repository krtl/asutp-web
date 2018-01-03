function MyParam(name, caption, description) {
  this.name = name;
  this.caption = caption;
  this.description = description;
  this.listNames = [];

  this.setListNames = function (listNames) {
    this.listNames = listNames;
  };
}

function myParamStringifyReplacer(key, value) {
  if (key === 'listNames') return undefined;
  return value;
}

const MyParamJsonSerialize = function (param) {
  return JSON.stringify(param, myParamStringifyReplacer);
}

module.exports = MyParam;
module.exports.MyParamJsonSerialize = MyParamJsonSerialize;

