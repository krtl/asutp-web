const mongoose = require('mongoose');
const fs = require('fs');
const async = require('async');
const config = require('../../config');
const logger = require('../../server/logger');


async.series([
  open,
  requireModels,
  importParamLists,
], (err) => {
  // logger.info(arguments);
  mongoose.disconnect();
  process.exit(err ? 255 : 0);
});

function open(callback) {
  logger.info('open');
// connect to the database and load dbmodels
  require('../dbmodels').connect(config.dbUri, false);  // eslint-disable-line global-require

  mongoose.connection.on('open', callback);
}

function requireModels(callback) {
  logger.info('models');
  require('mongoose').model('Param');  // eslint-disable-line global-require
  require('mongoose').model('ParamList');  // eslint-disable-line global-require

  async.each(Object.keys(mongoose.models), (modelName, callback) => {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
}

function compareParamList(paramList1, paramList2) {
  let result = ((paramList1.caption === paramList2.caption) && (paramList1.description === paramList2.description));
  if (result) {
    for (let i = 0; i < paramList1.params.length; i += 1) {
      const paramName = paramList1.params[i];
      if (paramList2.params.indexOf(paramName) < 0) {
        result = false;
      }
    }
    for (let i = 0; i < paramList2.params.length; i += 1) {
      const paramName = paramList2.params[i];
      if (paramList1.params.indexOf(paramName) < 0) {
        result = false;
      }
    }
  }
  return result;
}

function importParamLists(callback) {
  logger.info('importing paramLists');
  const rawdata = fs.readFileSync(`${config.importPath}paramLists.json`);
  let paramLists;
  try {
    paramLists = JSON.parse(rawdata);
  } catch (e) {
    logger.error(`create paramLists Error: ${e.message}`);
    callback(e);
    return;
  }

  async.each(paramLists, (paramListData, callback) => {
    const newParamList = new mongoose.models.ParamList(paramListData);

    // Check param names
    for (let i = 0; i < newParamList.params.length; i += 1) {
      const locName = newParamList.params[i];
      mongoose.models.Param.findOne({
        name: locName }, (err, param) => {
        if (err) callback(err);
        if (param) {
          // param exists
        } else {
          // param does not exist
          callback(new Error(`create paramList Error: Param "${locName}" does not exists for "${newParamList.name}"!`));
        }
      });
    }

    mongoose.models.ParamList.findOne({
      name: newParamList.name }, (err, paramList) => {
      if (err) callback(err);
      if (paramList) {
        // paramList exists

        if (!compareParamList(paramList, newParamList)) {
          mongoose.models.ParamList.update(
            { _id: paramList.id },
            { $set: { caption: newParamList.caption, description: newParamList.description, params: newParamList.params } }, (error) => {
              if (error) throw callback(error);
              logger.info(`ParamList "${newParamList.name}" updated`);
              callback(null);
            });
        } else {
          callback(null);
        }
      } else {
        // param does not exist
        newParamList.save((err) => {
          if (err) callback(err);
          logger.info(`ParamList "${newParamList.name}" inserted`);
          callback(null);
        });
      }
    });
  }, (err) => {
    if (err) {
      logger.error(`Failed: ${err}`);
    } else {
      logger.info('Success');
    }
    callback(err);
  });

//  const data = JSON.stringify(paramLists);
//  fs.writeFileSync(`${importPath}paramLists-2.json`, data);
}
