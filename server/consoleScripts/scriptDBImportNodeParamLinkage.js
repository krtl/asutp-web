// const mongoose = require('mongoose');
const fs = require('fs');
const moment = require('moment');
const DbNodeParamLinkage = require('../dbmodels/nodeParamLinkage');
const myDataModelNodes = require('../models/myDataModelNodes');

const async = require('async');
const config = require('../../config');

let warns = 0;
function setWarn(text) {
  warns += 1;
  console.warn(`[!] ${text}`);
}

function Start(cb) {
  const start = moment();
  async.series([
    // open,
    loadNodesModel,
    importLinkages,
  ], (err) => {
  // console.info(arguments);
    if (err) {
      console.error(`Failed! ${err}`);
    } else if (warns === 0) {
      const duration = moment().diff(start);
      console.info(`done in ${moment(duration).format('mm:ss.SSS')}`);
    } else {
      console.info(`done. warns ${warns}`);
    }

    // mongoose.disconnect();
    cb(err);
  });
}

// function open(callback) {
//     console.info('open');
//     // connect to the database and load dbmodels
//     require('../dbmodels').connect(config.dbUri, false);  // eslint-disable-line global-require

//     mongoose.connection.on('open', callback);
// }

function loadNodesModel(callback) {
  myDataModelNodes.LoadFromDB((err) => {
    callback(err);
  });
}

function importLinkages(callback) {
  let rawdata = null;
  const fileName = `${config.importPath}nodeParamLinkage.json`;
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
    const param = myDataModelNodes.GetParam(linkageRawData.paramPropValue);

    if (!node) {
      setWarn(`Unknown node "${linkageRawData.nodeName}" on importing linkages`);
      callback(null);
    } else if (!param) {
      setWarn(`Unknown param "${linkageRawData.paramPropValue}" on importing linkages`);
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
            DbNodeParamLinkage.updateOne({ _id: linkage.id },
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
            console.info(`Linkage "${newLinkage.nodeName}.${newLinkage.paramPropName}" inserted`);
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

module.exports.Start = Start;

