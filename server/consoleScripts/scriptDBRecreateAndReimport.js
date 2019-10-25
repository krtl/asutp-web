const mongoose = require('mongoose');
const async = require('async');
const moment = require('moment');
const config = require('../../config');
const creator = require('./scriptDBCreate');
const nodesImporter = require('./scriptDBImportNodes');
const paramsImporter = require('./scriptDBImportParams');
const nodeParamLinker = require('./scriptDBImportNodeParamLinkage');

const start = moment();

async.series([
  open,
  recreate,
  nodesImporter.Start,
  paramsImporter.Start,
  nodeParamLinker.Start,
], (err) => {
    // console.log(arguments);
  mongoose.disconnect();

  const duration = moment().diff(start);
  console.log(`all done in ${moment(duration).format('mm:ss.SSS')}`);

  process.exit(err ? 255 : 0);
});

function open(callback) {
  console.log('open');
  
  mongoose.set('useNewUrlParser', true);
  mongoose.set('useFindAndModify', false);
  mongoose.set('useCreateIndex', true);
  mongoose.set('useUnifiedTopology', true);

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

