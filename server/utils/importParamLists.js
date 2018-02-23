const mongoose = require('mongoose');
const fs = require('fs');
const async = require('async');
const config = require('../../config');


async.series([
  open,
  requireModels,
  importParamLists,
], (err) => {
  // console.log(arguments);
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

function compareParamList(paramList1, paramList2) {
  let result = ((paramList1.caption === paramList2.caption) && (paramList1.description === paramList2.description));
  if (result) {
    paramList1.params.forEach((paramName1) => {
      if (paramList2.params.indexOf(paramName1) < 0) {
        result = false;
      }
    });
    paramList2.params.forEach((paramName2) => {
      if (paramList1.params.indexOf(paramName2) < 0) {
        result = false;
      }
    });
  }
  return result;
}

function importParamLists(callback) {
  console.log('importing paramLists');
  const rawdata = fs.readFileSync(`${config.importPath}paramLists.json`);
  let paramLists;
  try {
    paramLists = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create paramLists Error: ${e.message}`);
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
        if (err) throw err;
        if (param) {
          // param exists
        } else {
          // param does not exist
          console.error(`create paramList Error: Param "${locName}" does not exists for "${newParamList.name}"!`);
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
      console.log('Success');
    }
    callback(err);
  });

//  const data = JSON.stringify(paramLists);
//  fs.writeFileSync(`${importPath}paramLists-2.json`, data);
}
