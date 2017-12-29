const async = require('async');

// const DbParam = require('mongoose').model('Param');
// const DbParamList = require('mongoose').model('ParamList');

let DbParam;
let DbParamList;

const logger = require('../logger');
const MyParam = require('./myParam');
const MyParamList = require('./myParamList');
const MyParamValue = require('./myParamValue');


const params = new Map();
const paramLists = new Map();

const LoadFromDB = function () {
  async.series([
    clearData,
    loadParams,
    loadParamLists,
    checkData,
  ], (err) => {
    if (err) {
      logger.error(`[sever] failed to load params: ${err}`);
      return 1;
    }
    logger.info(`[sever] loaded from DB with ${params.size} Params and ${paramLists.size} paramLists`);
    return 0;
  });
};

function clearData(cb) {
  params.clear();
  paramLists.clear();

  DbParam = require('mongoose').model('Param');
  DbParamList = require('mongoose').model('ParamList');

  return cb();
}

function loadParams(cb) {
  DbParam.find({}, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((prm) => {
      const p = new MyParam(prm.name,
         prm.caption,
         prm.description);
      params.set(prm.name, p);
    });
    return cb();
  });
}

function loadParamLists(cb) {
  DbParamList.find({}, (err, prmLists) => {
    if (err) return cb(err);

    prmLists.forEach((prmList) => {
      const prmNames = prmList.params;// .split(',');

      prmNames.forEach((prmName) => {
        if (!params.get(prmName)) {
          logger.error(`[sever] cannot find param "${prmName}" in "${prmList.name}"`);
        }
      });

      const pl = new MyParamList(prmList.name,
        prmList.caption,
        prmList.description,
        prmNames);

      paramLists.set(prmList.name, pl);
    });
    return cb();
  });
}


function checkData(cb) {
  // ..
  return cb();
}

const GetParam = function (paramName) {
  return params.get(paramName);
};

const GetParamsList = function (paramListName) {
  return paramLists.get(paramListName);
};

const GetAvailableParamsLists = function (userName) {
  const result = [];
  if (userName === '') {
    paramLists.forEach((value) => {
      result.push({ name: value.name,
        caption: value.caption,
        description: value.description });
    });
  } else {
    // not implemented yet.
  }

  return result;
};

module.exports.LoadFromDB = LoadFromDB;
module.exports.GetParam = GetParam;
module.exports.GetParamsList = GetParamsList;
module.exports.GetAvailableParamsLists = GetAvailableParamsLists;
