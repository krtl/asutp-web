const mongoose = require('mongoose');
const fs = require('fs');
const async = require('async');
const config = require('../../config');


// const Sheme = [
//   [ mongoose.models.NodeRegion, 'NodeRegions.json' ],
//   [ mongoose.models.NodeLEP, 'nodeLEPs.json' ],
//   [ mongoose.models.NodeLEPConnection, 'nodeLEPConnections.json' ],
//   [ mongoose.models.NodePS, 'nodePSs.json' ],
//   [ mongoose.models.NodePSPart, 'nodePSParts.json' ],
//   [ mongoose.models.NodeTransformer, 'nodeTransformers.json' ],
//   [ mongoose.models.NodeSection, 'nodeSections.json' ],
//   [ mongoose.models.NodeConnector, 'nodeConnectors.json' ],
//   [ mongoose.models.NodeEquipment, 'nodeEquipments.json' ],
// ];

async.series([
  open,
  dropDatabase,
  requireModels,
  createUsers,
  createParams,
  createParamLists,
  createParamValues,
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

function dropDatabase(callback) {
  console.log('drop');
  const db = mongoose.connection.db;
  db.dropDatabase(callback);
}

function requireModels(callback) {
  console.log('requiring models');
  require('mongoose').model('AuthUser');  // eslint-disable-line global-require
  require('mongoose').model('Param');  // eslint-disable-line global-require
  require('mongoose').model('ParamList');  // eslint-disable-line global-require
  require('mongoose').model('ParamValue');  // eslint-disable-line global-require

//  require('mongoose').model('NetNode');  // eslint-disable-line global-require
//  require('mongoose').model('NetWire');  // eslint-disable-line global-require

  require('mongoose').model('Node');  // eslint-disable-line global-require
  require('mongoose').model('NodeRegion');  // eslint-disable-line global-require
  require('mongoose').model('NodeLEP');  // eslint-disable-line global-require
  require('mongoose').model('NodeLEPConnection');  // eslint-disable-line global-require
  require('mongoose').model('NodePS');  // eslint-disable-line global-require
  require('mongoose').model('NodePSConnector');  // eslint-disable-line global-require
  require('mongoose').model('NodePSPart');  // eslint-disable-line global-require
  require('mongoose').model('NodeTransformer');  // eslint-disable-line global-require
  require('mongoose').model('NodeTransformerConnector');  // eslint-disable-line global-require
  require('mongoose').model('NodeSection');  // eslint-disable-line global-require
  require('mongoose').model('NodeSectionConnector');  // eslint-disable-line global-require
  require('mongoose').model('NodeEquipment');  // eslint-disable-line global-require


  async.each(Object.keys(mongoose.models), (modelName, callback) => {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
}

function createUsers(callback) {
  console.log('creating users');
//  var users = require(importPath +'/users.json');

  const fileName = `${config.importPath}users.json`;
  let rawdata = '';
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    return;
  }

  const users = JSON.parse(rawdata);

  async.each(users, (userData, callback) => {
    const user = new mongoose.models.AuthUser(userData);
    user.save((err) => {
      if (err) callback(err);
      console.log(`User "${user.email}" inserted`);
      callback(null);
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  // const data = JSON.stringify(users);
  // fs.writeFileSync(`${config.importPath}users-2.json`, data);
}

function createParams(callback) {
  console.log('create params');
  const rawdata = fs.readFileSync(`${config.importPath}params.json`);
  const params = JSON.parse(rawdata);

  async.each(params, (paramData, callback) => {
    const param = new mongoose.models.Param(paramData);
    param.save((err) => {
      if (err) callback(err);
      console.log(`Param "${param.name}" inserted`);
      callback(null);
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  // const data = JSON.stringify(params);
  // fs.writeFileSync(`${config.importPath}params-2.json`, data);
}

function createParamLists(callback) {
  console.log('create paramLists');
  const rawdata = fs.readFileSync(`${config.importPath}paramLists.json`);
  let paramLists;
  try {
    paramLists = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create paramLists Error: ${e.message}`);
    return;
  }

  async.each(paramLists, (paramListData, callback) => {
    const paramList = new mongoose.models.ParamList(paramListData);

    // Check param names
    for (let i = 0; i < paramList.params.length; i += 1) {
      const locName = paramList.params[i];
      mongoose.models.Param.findOne({
        name: locName }, (err, param) => {
        if (err) throw err;
        if (param) {
          // param exists
        } else {
          // param does not exist
          console.error(`create paramLists Error: Param "${locName}" does not exists for "${paramList.name}"!`);
        }
      });
    }

    paramList.save((err) => {
      if (err) callback(err);
      console.log(`ParamList "${paramList.name}" inserted`);
      callback(null);
    });
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });

  // const data = JSON.stringify(paramLists);
  // fs.writeFileSync(`${config.importPath}paramLists-2.json`, data);
}

function createParamValues(callback) {
  console.log('creating paramValues');
  const fileName = `${config.importPath}paramValues.json`;
  console.log(`importing from "${fileName}"..`);
  const rawdata = fs.readFileSync(fileName);
  let paramValues;
  try {
    paramValues = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create paramValues Error: ${e.message}`);
    return;
  }

  async.each(paramValues, (paramValueData, callback) => {
    const paramValue = new mongoose.models.ParamValue(paramValueData);

    // Check param name
    const locName = paramValue.paramName;
    mongoose.models.Param.findOne({
      name: locName }, (err, param) => {
      if (err) throw err;
      if (param) {
        // param exists
        paramValue.save((err) => {
          if (err) callback(err);
          console.log(`ParamValue "${param.name}" inserted`);
          callback(null);
        });
      } else {
          // param does not exist
        console.error(`create paramValue Error: Param "${locName}" does not exists for "${paramValue.name}"!`);
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


  // const data = JSON.stringify(paramValues);
  // fs.writeFileSync(`${config.importPath}paramValues-2.json`, data);
}

