const mongoose = require('mongoose');
const fs = require('fs');
const async = require('async');
const config = require('../../config');

const FileNames = [
  'asutpParams.json',
  'asutpParamLists.json',
  // 'testParams.json',
  // 'testParamLists.json',
  'asutpConnections.json',
];

function Start(cb) {
  console.time('importParams');
  async.series([
    // open,
    requireModels,
    importParams,
    importParamLists,
    importAsutpConnections,
  ], (err) => {
//  console.log(arguments);
    if (err) console.error('Failed!');
    console.timeEnd('importParams');
    // mongoose.disconnect();
    cb(err);
  });
}

// function open(callback) {
//   console.log('open');
// // connect to the database and load dbmodels
//   require('../dbmodels').connect(config.dbUri, false);  // eslint-disable-line global-require

//   mongoose.connection.on('open', callback);
// }

function requireModels(callback) {
  console.log('models');
  require('mongoose').model('Param');  // eslint-disable-line global-require
  require('mongoose').model('ParamList');  // eslint-disable-line global-require
  require('mongoose').model('AsutpConnection');  // eslint-disable-line global-require

  async.each(Object.keys(mongoose.models), (modelName, callback) => {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
}

function importParams(callback) {
  console.log('importing params..');

  const fileName = `${config.importPath}${FileNames[0]}`;

  if (!fs.existsSync(fileName)) {
    const err = `file "${fileName}" does not exists`;
    console.log(err);
    callback(err);
    return;
  }

  const rawdata = fs.readFileSync(fileName);
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

  const fileName = `${config.importPath}${FileNames[1]}`;

  if (!fs.existsSync(fileName)) {
    const err = `file "${fileName}" does not exists`;
    console.log(err);
    callback(err);
  }

  const rawdata = fs.readFileSync(fileName);
  const paramLists = JSON.parse(rawdata);

  async.each(paramLists, (paramData, callback) => {
    const newParamList = new mongoose.models.ParamList(paramData);

    newParamList.description = paramData.sapCode;

    mongoose.models.ParamList.findOne({
      name: newParamList.name }, (err, paramList) => {
      if (err) callback(err);
      if (paramList) {
        if ((paramList.caption !== newParamList.caption) || (paramList.description !== newParamList.description) || (paramList.paramNames !== newParamList.paramNames)) {
          mongoose.models.ParamList.update({ _id: paramList.id },
             { $set: { caption: newParamList.caption, description: newParamList.description, paramNames: newParamList.paramNames } }, (error) => {
               if (error) throw callback(error);
               console.log(`ParamList "${newParamList.name}" updated`);
               callback(null);
             });
        } else {
          callback(null);
        }
      } else {
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

function importAsutpConnections(callback) {
  console.log('importing ASUTP Connections..');

  const fileName = `${config.importPath}${FileNames[2]}`;

  if (!fs.existsSync(fileName)) {
    const err = `file "${fileName}" does not exists`;
    console.log(err);
    callback(err);
    return;
  }

  const rawdata = fs.readFileSync(fileName);
  const connections = JSON.parse(rawdata);

  async.each(connections, (paramData, callback) => {
    const newConnection = new mongoose.models.AsutpConnection(paramData);

    mongoose.models.AsutpConnection.findOne({
      name: newConnection.name }, (err, asutpConnection) => {
      if (err) callback(err);
      if (asutpConnection) {
        if ((asutpConnection.caption !== newConnection.caption) ||
          (asutpConnection.sapCode !== newConnection.sapCode) ||
          (asutpConnection.voltage !== newConnection.voltage) ||
          (asutpConnection.connectionNumber !== newConnection.connectionNumber) ||
          (asutpConnection.VVParamName !== newConnection.VVParamName) ||
          (asutpConnection.PParamName !== newConnection.PParamName)) {
          mongoose.models.AsutpConnection.update({ _id: asutpConnection.id },
            { $set: { caption: newConnection.caption,
              sapCode: newConnection.sapCode,
              voltage: newConnection.voltage,
              connectionNumber: newConnection.connectionNumber,
              VVParamName: newConnection.VVParamName,
              PParamName: newConnection.PParamName,
            } }, (error) => {
              if (error) throw callback(error);
              console.log(`asutpConnection "${newConnection.name}" updated`);
              callback(null);
            });
        } else {
          callback(null);
        }
      } else {
        newConnection.save((err) => {
          if (err) callback(err);
          console.log(`asutpConnection "${newConnection.name}" inserted`);
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

module.exports.Start = Start;
