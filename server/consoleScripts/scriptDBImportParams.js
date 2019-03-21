const mongoose = require('mongoose');
const fs = require('fs');
const moment = require('moment');
const async = require('async');
const config = require('../../config');

const FileNames = [
  'asutpParams.json',
  'asutpParamLists.json',
  'asutpConnections.json',
];


function Start(cb) {
  const start = moment();
  async.series([
    // open,
    requireModels,
    importParams,
    importParamLists,
    importAsutpConnections,
  ], (err) => {
//  console.log(arguments);
    if (err) console.error('Failed!');

    if (err) {
      console.error(`Importing params failed with ${err}`);
    } else {
      const duration = moment().diff(start);
      console.log(`Importing params done in ${moment(duration).format('mm:ss.SSS')}`);
    }
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
  require('mongoose').model('NodeSchema');  // eslint-disable-line global-require
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
    const newNodeSchema = new mongoose.models.NodeSchema(paramData);

    newNodeSchema.description = paramData.sapCode;

    mongoose.models.NodeSchema.findOne({
      name: newNodeSchema.name }, (err, schema) => {
      if (err) callback(err);
      if (schema) {
        if ((schema.caption !== newNodeSchema.caption) || (schema.description !== newNodeSchema.description) || (schema.paramNames !== newNodeSchema.paramNames)) {
          mongoose.models.NodeSchema.update({ _id: schema.id },
             { $set: { caption: newNodeSchema.caption, description: newNodeSchema.description, paramNames: newNodeSchema.paramNames } }, (error) => {
               if (error) throw callback(error);
               console.log(`NodeSchema "${newNodeSchema.name}" updated`);
               callback(null);
             });
        } else {
          callback(null);
        }
      } else {
        newNodeSchema.save((err) => {
          if (err) callback(err);
          console.log(`NodeSchema "${newNodeSchema.name}" inserted`);
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
          (asutpConnection.UlParamName !== newConnection.UlParamName) ||
          (asutpConnection.PParamName !== newConnection.PParamName)) {
          mongoose.models.AsutpConnection.update({ _id: asutpConnection.id },
            { $set: { caption: newConnection.caption,
              sapCode: newConnection.sapCode,
              voltage: newConnection.voltage,
              connectionNumber: newConnection.connectionNumber,
              VVParamName: newConnection.VVParamName,
              PParamName: newConnection.PParamName,
              UlParamName: newConnection.UlParamName,
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
