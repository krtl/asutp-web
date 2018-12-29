const mongoose = require('mongoose');
const fs = require('fs');
const async = require('async');
const config = require('../../config');


async.series([
  open,
  requireModels,
  createNodesObsolete,
  createWiresObsolete,
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
  require('mongoose').model('NetNode');  // eslint-disable-line global-require
  require('mongoose').model('NetWire');  // eslint-disable-line global-require

  async.each(Object.keys(mongoose.models), (modelName, callback) => {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
}

function createNodesObsolete(callback) {
  console.log('create nodes obsolete');

  const fileName = `${config.importPath}obsolete-nodes.json`;

  if (!fs.existsSync(fileName)) {
    console.log(`file "${fileName}" does not exists`);
    callback();
    return;
  }

  const rawdata = fs.readFileSync(fileName);
  const nodes = JSON.parse(rawdata);

  async.each(nodes, (data, callback) => {
    const node = new mongoose.models.NetNode(data);
    node.save((err) => {
      if (err) callback(err);
      console.log(`Node "${node.name}" inserted`);
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

function createWiresObsolete(callback) {
  console.log('create wires obsolete');
  const fileName = `${config.importPath}obsolete-wires.json`;

  if (!fs.existsSync(fileName)) {
    console.log(`file "${fileName}" does not exists`);
    callback();
    return;
  }

  const rawdata = fs.readFileSync(fileName);
  const nodes = JSON.parse(rawdata);

  async.each(nodes, (data, callback) => {
    const wire = new mongoose.models.NetWire(data);
    wire.save((err) => {
      if (err) callback(err);
      console.log(`Wire "${wire.name}" inserted`);
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

