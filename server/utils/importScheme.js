const mongoose = require('mongoose');
const fs = require('fs');
const async = require('async');
const config = require('../../config');


async.series([
  open,
  requireModels,
  importNodes,
  importWires,
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

function importNodes(callback) {
  const fileName = `${config.importPath}cells.json`;
  console.log(`importing nodes from "${fileName}"..`);
  let rawdata = '';
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    return;
  }

  const nodes = JSON.parse(rawdata);

  async.each(nodes, (nodeData, callback) => {
    const newNode = new mongoose.models.NetNode(nodeData);

    mongoose.models.NetNode.findOne({
      name: newNode.name }, (err, node) => {
      if (err) callback(err);
      if (node) {
        // node exists

        if ((node.caption !== newNode.caption) ||
          (node.description !== newNode.description) ||
          (node.x !== newNode.x) ||
          (node.y !== newNode.y)) {
          mongoose.models.NetNode.update({ _id: node.id },
            { $set: {
              caption: newNode.caption,
              description: newNode.description,
              x: newNode.x,
              y: newNode.y } }, (error) => {
                if (error) throw callback(error);
                console.log(`NetNode "${newNode.name}" updated`);
                callback(null);
              });
        } else {
          callback(null);
        }
      } else {
        // node does not exist
        newNode.save((err) => {
          if (err) callback(err);
          console.log(`NetNode "${newNode.name}" inserted`);
          callback(null);
        });
      }
    });
  }, (err) => {
    if (err) {
      console.log(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });
}



function importWires(callback) {
  const fileName = `${config.importPath}wires.json`;
  console.log(`importing wires from "${fileName}"..`);
  let rawdata = '';
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    return;
  }

  const wires = JSON.parse(rawdata);

  async.each(wires, (nodeData, callback) => {
    const newWire = new mongoose.models.NetWire(nodeData);

    mongoose.models.NetWire.findOne({
      name: newWire.id }, (err, node) => {
      if (err) callback(err);
      if (node) {
        // wire exists

        if ((node.nodeFrom !== newWire.nodeTo) ||
          (node.description !== newWire.description) ||
          (node.x !== newWire.x) ||
          (node.y !== newWire.y)) {
          mongoose.models.NetNode.update({ _id: node.id },
            { $set: {
                caption: newWire.caption,
                description: newWire.description,
                x: newWire.x,
                y: newWire.y } }, (error) => {
              if (error) throw callback(error);
              console.log(`NetNode "${newWire.name}" updated`);
              callback(null);
            });
        } else {
          callback(null);
        }
      } else {
        // node does not exist
        newWire.save((err) => {
          if (err) callback(err);
          console.log(`NetNode "${newWire.name}" inserted`);
          callback(null);
        });
      }
    });
  }, (err) => {
    if (err) {
      console.log(`Failed: ${err}`);
    } else {
      console.log('Success.');
    }
    callback(err);
  });
}
