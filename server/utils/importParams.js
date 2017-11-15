const mongoose = require('mongoose');
const fs = require('fs');
const async = require('async');
const config = require('../../config');

const importPath = 'D:/mongodb_bases/';

async.series([
  open,
  requireModels,
  createParams,
], function (err) {
  console.log(arguments);
  mongoose.disconnect();
  process.exit(err ? 255 : 0);
});

function open(callback) {
  console.log('open');
// connect to the database and load models
  require('../../server/models').connect(config.dbUri);

  mongoose.connection.on('open', callback);
}

function requireModels(callback) {
  console.log('models');
  require('mongoose').model('Param');
  require('mongoose').model('ParamList');

  async.each(Object.keys(mongoose.models), (modelName, callback) => {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
}

function createParams(callback) {
  console.log('create params');
  const rawdata = fs.readFileSync(`${importPath}params.json`);
  const params = JSON.parse(rawdata);

  async.each(params, (paramData, callback) => {
    const param = new mongoose.models.Param(paramData);
    param.save(callback);
  }, callback);

  const data = JSON.stringify(params);
  fs.writeFileSync(`${importPath}params-2.json`, data);
}
