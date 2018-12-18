const mongoose = require('mongoose');
const fs = require('fs');
const async = require('async');
const config = require('../../config');


async.series([
  open,
  requireModels,
  importParams,
  importParamLists,
], (err) => {
//  console.log(arguments);
  mongoose.disconnect();
  process.exit(err ? 255 : 0);
});

function open(callback) {
  console.log('open');
// connect to the database and load dbmodels
  require('../dbmodels').connect(config.dbUri, false);  // eslint-disable-line global-require

  mongoose.connection.on('open', callback);
}

function requireModels(callback) {
  console.log('models');
  require('mongoose').model('Param');  // eslint-disable-line global-require
  require('mongoose').model('ParamList');  // eslint-disable-line global-require

  async.each(Object.keys(mongoose.models), (modelName, callback) => {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
}

function importParams(callback) {
  console.log('importing params..');
  const rawdata = fs.readFileSync(`${config.importPath}asutpParams.json`);
  const params = JSON.parse(rawdata);

  async.each(params, (paramData, callback) => {
    const newParam = new mongoose.models.Param(paramData);

    mongoose.models.Param.findOne({
      name: newParam.name }, (err, param) => {
      if (err) callback(err);
      if (param) {
          // param exists

        if ((param.caption !== newParam.caption) || (param.description !== newParam.description)) {
          mongoose.models.Param.update({ _id: param.id }, { $set: { caption: newParam.caption, description: newParam.description } }, (error) => {
            if (error) throw callback(error);
            console.log(`Param "${newParam.name}" updated`);
            callback(null);
          });
        } else {
          callback(null);
        }
      } else {
          // param does not exist
        newParam.save((err) => {
          if (err) callback(err);
          console.log(`Param "${newParam.name}" inserted`);
          callback(null);
        });
      }
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });
}

function importParamLists(callback) {
  console.log('importing paramLists..');
  const rawdata = fs.readFileSync(`${config.importPath}asutpParamLists.json`);
  const paramLists = JSON.parse(rawdata);

  async.each(paramLists, (paramData, callback) => {
    const newParamList = new mongoose.models.ParamList(paramData);

    newParamList.params = paramData.paramNames.split(',');

    mongoose.models.ParamList.findOne({
      name: newParamList.name }, (err, paramList) => {
      if (err) callback(err);
      if (paramList) {
        // param exists

        if ((paramList.caption !== newParamList.caption) || (paramList.description !== newParamList.description) || (paramList.paramNames !== newParamList.params)) {
          mongoose.models.ParamList.update({ _id: paramList.id },
             { $set: { caption: newParamList.caption, description: newParamList.description, params: newParamList.params } }, (error) => {
               if (error) throw callback(error);
               console.log(`ParamList "${newParamList.name}" updated`);
               callback(null);
             });
        } else {
          callback(null);
        }
      } else {
          // param does not exist
        newParamList.save((err) => {
          if (err) callback(err);
          console.log(`ParamList "${newParamList.name}" inserted`);
          callback(null);
        });
      }
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });
}
