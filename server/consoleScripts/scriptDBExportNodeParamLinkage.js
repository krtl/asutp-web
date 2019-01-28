const mongoose = require('mongoose');
const fs = require('fs');
const DbNodeParamLinkage = require('../dbmodels/nodeParamLinkage');

const async = require('async');
const config = require('../../config');


async.series([
  open,
  exportLinkages,
], (err) => {
  // console.info(arguments);
  if (err) {
    console.info(`Failed! ${err}`);
  } else {
    console.info('done.');
  }
  console.timeEnd('export');

  mongoose.disconnect();
  process.exit(err ? 1 : 0);
});

function open(callback) {
  console.info('open');
// connect to the database and load dbmodels
  require('../dbmodels').connect(config.dbUri, false);  // eslint-disable-line global-require

  mongoose.connection.on('open', callback);

  console.time('export');
}

function exportLinkages(callback) {
  DbNodeParamLinkage.find({}, (err, linkages) => {
    if (err) {
      callback(err);
    } else {
      const json = JSON.stringify(linkages);
      fs.writeFile(`${config.exportPath}nodeParamLinkage${Date.now()}.json`, json, 'utf8', (err) => {
        if (err) {
          callback(err);
              // console.error(`Failed! Error: ${err}`);
        } else {
              // console.info('FileWriteDone!');
          callback(err);
        }
      });
    }
  }).select({ nodeName: 1, paramPropName: 1, paramPropValue: 1, _id: 0 });
}
