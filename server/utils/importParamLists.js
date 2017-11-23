const mongoose = require('mongoose');
const fs = require('fs');
const async = require('async');
const config = require('../../config');

const importPath = 'D:/mongodb_bases/';

async.series([
  open,
  requireModels,
  createParamLists,
], function (err) {
  console.log(arguments);
  mongoose.disconnect();
  process.exit(err ? 255 : 0);
});

function open(callback) {
  console.log('open');
// connect to the database and load dbmodels
  require('../dbmodels').connect(config.dbUri);

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

function createParamLists(callback) {
  console.log('create paramLists');
  const rawdata = fs.readFileSync(`${importPath}paramLists.json`);
  let paramLists;
  try {
    paramLists = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create paramLists Error: ${e.message}`);
    return;
  }

  async.each(paramLists, (paramListData, callback) => {
    const paramList = new mongoose.models.MyParamList(paramListData);

    // Check param names
    for (let i = 0; i < paramList.params.length; i++) {
      const locName = paramList.params[i];
      mongoose.models.MyParam.findOne({
        name: locName }, (err, param) => {
        if (err) throw err;
        if (param) {
          // param exists
        } else {
          // param does not exist
          console.error(`create paramLists Error: Param "${locName}" does not exists!`);
        }
      });
    }

    paramList.save(callback);
  }, callback);

  const data = JSON.stringify(paramLists);
  fs.writeFileSync(`${importPath}paramLists-2.json`, data);
}
