const mongoose = require('mongoose');
const fs = require('fs');
const DbNodeParamLinkage = require('../dbmodels/nodeParamLinkage');
const myDataModelParams = require('../models/myDataModelParams');
const myDataModelNodes = require('../models/myDataModelNodes');

const async = require('async');
const config = require('../../config');

let warns = 0;
function setWarn(text) {
  warns += 1;
  console.warn(`[!] ${text}`);
}


async.series([
  open,
  loadNodesModel,
  loadParamsModel,
  importLinkages,
], (err) => {
  // console.info(arguments);
  if (err) {
    console.error(`Failed! ${err}`);
  } else if (warns === 0) {
    console.info('done.');
  } else {
    console.info(`done. warns ${warns}`);
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

function loadNodesModel(callback) {
  myDataModelNodes.LoadFromDB((err) => {
    callback(err);
  });
}

function loadParamsModel(callback) {
  myDataModelParams.LoadFromDB((err) => {
    callback(err);
  });
}

function importLinkages(callback) {
  let rawdata = null;
  const fileName = `${config.exportPath}nodeParamLinkage.json`;
  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    callback(err);
    return;
  }

  let linkages;
  try {
    linkages = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create linkage Error: ${e.message}`);
    callback(e);
    return;
  }

  async.each(linkages, (linkageRawData, callback) => {
    const node = myDataModelNodes.GetNode(linkageRawData.nodeName);
    const param = myDataModelParams.getParam(linkageRawData.paramPropValue);

    if (!node) {
      setWarn(`Unknown node ${linkageRawData.nodeName}`);
      callback(null);
    } else if (!param) {
      setWarn(`Unknown param ${linkageRawData.paramPropValue}`);
      callback(null);
    } else {
      const newLinkage = new DbNodeParamLinkage(linkageRawData);
      DbNodeParamLinkage.findOne({
        nodeName: linkageRawData.nodeName,
        paramPropName: linkageRawData.paramPropName,
      }, (err, linkage) => {
        if (err) callback(err);
        if (linkage) {
          if (linkageRawData.paramPropValue !== linkage.paramPropValue) {
            DbNodeParamLinkage.update({ _id: linkage.id },
              { $set: {
                paramPropValue: linkageRawData.paramPropValue,
              } }, (error) => {
                if (error) throw callback(error);
                console.info(`Linkage "${linkage.nodeName}.${linkage.paramPropName}" updated`);
                callback(null);
              });
          } else {
            callback(null);
          }
        } else {
          newLinkage.save((err) => {
            if (err) callback(err);
            console.info(`Linkage "${linkage.nodeName}.${linkage.paramPropName}" inserted`);
            callback(null);
          });
        }
      });
    }
  }, (err) => {
    if (err) {
      console.error(`Failed: ${err}`);
    } else {
      console.info('Success');
    }
    callback(err);
  });
}

