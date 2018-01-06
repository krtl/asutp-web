const mongoose = require('mongoose');
const fs = require('fs');
const async = require('async');
const config = require('../../config');


async.series([
  open,
  dropDatabase,
  requireModels,
  createUsers,
  createParams,
  createParamLists,
  createCells,
  createTransformers,
  createWires,
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
  console.log('models');
  // require('dbmodels/user');
  require('mongoose').model('AuthUser');  // eslint-disable-line global-require
  require('mongoose').model('Param');  // eslint-disable-line global-require
  require('mongoose').model('ParamList');  // eslint-disable-line global-require
  require('mongoose').model('NetNode');  // eslint-disable-line global-require
//  require('mongoose').model('NetNodeCell');  // eslint-disable-line global-require
  require('mongoose').model('NetNodeTransformer');  // eslint-disable-line global-require
  require('mongoose').model('NetWire');  // eslint-disable-line global-require

  async.each(Object.keys(mongoose.models), (modelName, callback) => {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
}

function createUsers(callback) {
  console.log('create users');
//  var users = require(importPath +'/users.json');

  const rawdata = fs.readFileSync(`${config.importPath}users.json`);
  const users = JSON.parse(rawdata);

  async.each(users, (userData, callback) => {
    const user = new mongoose.models.AuthUser(userData);
    user.save(callback);
  }, callback);

  const data = JSON.stringify(users);
  fs.writeFileSync(`${config.importPath}users-2.json`, data);
}

function createParams(callback) {
  console.log('create params');
  const rawdata = fs.readFileSync(`${config.importPath}params.json`);
  const params = JSON.parse(rawdata);

  async.each(params, (paramData, callback) => {
    const param = new mongoose.models.Param(paramData);
    param.save(callback);
  }, callback);

  const data = JSON.stringify(params);
  fs.writeFileSync(`${config.importPath}params-2.json`, data);
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

    paramList.save(callback);
  }, callback);

  const data = JSON.stringify(paramLists);
  fs.writeFileSync(`${config.importPath}paramLists-2.json`, data);
}

function createCells(callback) {
  console.log('create cells');
  const rawdata = fs.readFileSync(`${config.importPath}cells.json`);
  let cells;
  try {
    cells = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create cells Error: ${e.message}`);
    return;
  }

  async.each(cells, (cellData, callback) => {
    const cell = new mongoose.models.NetNodeCell(cellData);
    cell.save(callback);
  }, callback);

  const data = JSON.stringify(cells);
  fs.writeFileSync(`${config.importPath}cells-2.json`, data);
}

function createTransformers(callback) {
  console.log('create cells');
  const rawdata = fs.readFileSync(`${config.importPath}transformers.json`);
  let transformers;
  try {
    transformers = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create transformers Error: ${e.message}`);
    return;
  }

  async.each(transformers, (transformerData, callback) => {
    const trans = new mongoose.models.NetNodeTransformer(transformerData);
    trans.save(callback);
  }, callback);

  const data = JSON.stringify(transformers);
  fs.writeFileSync(`${config.importPath}transformers-2.json`, data);
}

function createWires(callback) {
  console.log('create wires');
  const rawdata = fs.readFileSync(`${config.importPath}wires.json`);
  let wires;
  try {
    wires = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create wires Error: ${e.message}`);
    return;
  }

  async.each(wires, (wireData, callback) => {
    const wire = new mongoose.models.NetWire(wireData);

    // Check nodes
    for (let i = 0; i < wire.nodeIds.length; i += 1) {
      const locId = wire.nodeIds[i];
      mongoose.models.NetNode.findOne({
        id: locId,
      }, (err, netNode) => {
        if (err) throw err;
        if (netNode) {
          // node exists
        } else {
          // node does not exist
          console.error(`create wire Error: NetNode "${locId}" does not exists!`);
        }
      });
    }

    wire.save(callback);
  }, callback);

  const data = JSON.stringify(wires, null, ' ');
  fs.writeFileSync(`${config.importPath}wires-2.json`, data);
}
