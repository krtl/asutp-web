function MyParam(name, caption, description) {
  this.name = name;
  this.caption = caption;
  this.description = description;
  this.listNames = [];

  this.setListNames = (listNames) => {
    this.listNames = listNames;
  };
}

function myParamStringifyReplacer(key, value) {
  if (key === 'listNames') return undefined;
  return value;
}

const MyParamJsonSerialize = param => JSON.stringify(param, myParamStringifyReplacer);

module.exports = MyParam;
module.exports.MyParamJsonSerialize = MyParamJsonSerialize;

