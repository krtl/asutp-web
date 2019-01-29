const mongoose = require('mongoose');
const async = require('async');
const config = require('../../config');
const creator = require('./scriptDBCreate');
const nodesImporter = require('./scriptDBImportNodes');
const paramsImporter = require('./scriptDBImportParams');
const nodeParamLinker = require('./scriptDBImportNodeParamLinkage');


async.series([
  open,
  recreate,
  nodesImporter.Start,
  paramsImporter.Start,
  nodeParamLinker.Start,
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

function recreate(callback) {
  if (process.argv.indexOf('recreate') >= 0) {
    creator.Start(callback);
  } else {
    callback();
  }
}

