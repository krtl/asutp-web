const async = require('async');

// const DbParam = require('mongoose').model('Param');
// const DbParamList = require('mongoose').model('ParamList');

let DbUser;
let DbParam;
let DbParamList;

const logger = require('../logger');
const MyParam = require('./myParam');
const MyParamList = require('./myParamList');
// const MyParamValue = require('./myParamValue');


const users = new Map();
const params = new Map();
const paramLists = new Map();

const LoadFromDB = (cb) => {
  async.series([
    clearData,
    loadUsers,
    loadParams,
    loadParamLists,
    linkData,
    checkData,
  ], (err) => {
    if (err) {
      logger.error(`[sever] failed to load params: ${err}`);
      return cb(err);
    }
    logger.info(`[sever] loaded from DB with ${params.size} Params and ${paramLists.size} paramLists`);
    return cb('');
  });
};

function clearData(cb) {
  users.clear();
  params.clear();
  paramLists.clear();

  DbUser = require('mongoose').model('AuthUser');  // eslint-disable-line global-require
  DbParam = require('mongoose').model('Param');  // eslint-disable-line global-require
  DbParamList = require('mongoose').model('ParamList');  // eslint-disable-line global-require

  return cb();
}

function loadUsers(cb) {
  DbUser.find({}, null, { sort: { name: 1 } }, (err, usrs) => {
    if (err) return cb(err);
    usrs.forEach((usr) => {
      users.set(usr.name, usr.might);
    });
    return cb();
  });
}

function loadParams(cb) {
  DbParam.find({}, null, { sort: { name: 1 } }, (err, prms) => {
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
  DbParamList.find({}, null, { sort: { name: 1 } }, (err, prmLists) => {
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

function linkData(cb) {
  params.forEach((prm) => {
    const locListNames = [];
    paramLists.forEach((prmList) => {
      if (prmList.paramNames.indexOf(prm.name) > -1) {
        locListNames.push(prmList.name);
      }
    });
    prm.setListNames(locListNames);
  });

  return cb();
}

const GetParam = paramName => params.get(paramName);

const GetParamsOfList = (paramListName) => {
  const paramList = paramLists.get(paramListName);
  if (paramList) {
    const resultParams = [];
    paramList.paramNames.forEach((prmName) => {
      const param = params.get(prmName);
      if (param) {
        resultParams.push(param);
      } else {
        logger.error(`[sever] cannot find param "${prmName}" in "${paramList.name}"`);
      }
    });
    return resultParams;
  }
  return [];
};

const GetParamsList = paramListName => paramLists.get(paramListName);

const GetAvailableParamsLists = (userName) => {
  const result = [];
  if (userName === '') { // temporary!
    paramLists.forEach((value) => {
      result.push({ name: value.name,
        caption: value.caption,
        description: value.description });
    });
  } else if (users.has(userName)) {
    const locMight = users.get(userName);
    const locMights = locMight.split(',');
    locMights.forEach((elem) => {
      if (paramLists.has(elem)) {
        const locList = paramLists.get(elem);
        if (locList !== undefined) {
          result.push(locList);
        }
      }
    });
  }
  return result;
};

module.exports.LoadFromDB = LoadFromDB;
module.exports.GetParam = GetParam;
module.exports.GetParamsOfList = GetParamsOfList;
module.exports.GetParamsList = GetParamsList;
module.exports.GetAvailableParamsLists = GetAvailableParamsLists;
