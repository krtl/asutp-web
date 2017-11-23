const mongoose = require('mongoose');
const fs = require('fs');
const async = require('async');
const config = require('../../config');

const importPath = 'D:/mongodb_bases/';

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

function dropDatabase(callback) {
  console.log('drop');
  const db = mongoose.connection.db;
  db.dropDatabase(callback);
}

function requireModels(callback) {
  console.log('models');
  // require('dbmodels/user');
  require('mongoose').model('AuthUser');
  require('mongoose').model('Param');
  require('mongoose').model('ParamList');
  require('mongoose').model('NetNode');
//  require('mongoose').model('NetNodeCell');
  require('mongoose').model('NetNodeTransformer');
  require('mongoose').model('NetWire');

  async.each(Object.keys(mongoose.models), (modelName, callback) => {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
}

function createUsers(callback) {
  console.log('create users');
//  var users = require(importPath +'/users.json');

  const rawdata = fs.readFileSync(`${importPath}users.json`);
  const users = JSON.parse(rawdata);

  async.each(users, (userData, callback) => {
    const user = new mongoose.models.AuthUser(userData);
    user.save(callback);
  }, callback);

  const data = JSON.stringify(users);
  fs.writeFileSync(`${importPath}users-2.json`, data);
}

function createParams(callback) {
  console.log('create params');
  const rawdata = fs.readFileSync(`${importPath}params.json`);
  const params = JSON.parse(rawdata);

  async.each(params, (paramData, callback) => {
    const param = new mongoose.models.MyParam(paramData);
    param.save(callback);
  }, callback);

  const data = JSON.stringify(params);
  fs.writeFileSync(`${importPath}params-2.json`, data);
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

function createCells(callback) {
  console.log('create cells');
  const rawdata = fs.readFileSync(`${importPath}cells.json`);
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
  fs.writeFileSync(`${importPath}cells-2.json`, data);
}

function createTransformers(callback) {
  console.log('create cells');
  const rawdata = fs.readFileSync(`${importPath}transformers.json`);
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
  fs.writeFileSync(`${importPath}transformers-2.json`, data);
}

function createWires(callback) {
  console.log('create wires');
  const rawdata = fs.readFileSync(`${importPath}wires.json`);
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
    for (let i = 0; i < wire.nodeIds.length; i++) {
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
  fs.writeFileSync(`${importPath}wires-2.json`, data);
}
