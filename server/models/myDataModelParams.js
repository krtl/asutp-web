const async = require('async');
const moment = require('moment');

const DbUser = require('../dbmodels/authUser');  // eslint-disable-line global-require
const DbParam = require('../dbmodels/param');  // eslint-disable-line global-require
const DbParamList = require('../dbmodels/paramList');  // eslint-disable-line global-require

const myDataModelNodes = require('../models/myDataModelNodes');

const logger = require('../logger');
const MyParam = require('./myParam');
const MyParamList = require('./myParamList');
// const MyParamValue = require('./myParamValue');

const users = new Map();
const params = new Map();
const paramLists = new Map();

let errs = 0;
function setError(text) {
  errs += 1;
  logger.error(`[ModelParams] ${text}`);
}

process
  .on('unhandledRejection', (reason, p) => {
    setError(`Unhandled Rejection at Promise: ${reason}  ${p}`);
  })
  .on('uncaughtException', (err) => {
    setError(`Uncaught Exception thrown: ${err.message} \r\n callstack: ${err.stack}`);
    process.exit(2);
  });

const LoadFromDB = (cb) => {
  const start = moment();
  async.series([
    clearData,
    loadUsers,
    loadParams,
    loadParamLists,
    loadParamListsFromNodesModel,
    makeListNamesForEachParam,
  ], () => {
    let res = null;
    if (errs === 0) {
      const duration = moment().diff(start);
      logger.info(`[ModelParams] loaded from DB with ${params.size} Params and ${paramLists.size} paramLists in ${moment(duration).format('mm:ss.SSS')}`);
    } else {
      res = `loading params failed with ${errs} errors!`;
      logger.error(res);
    }
    return cb(res);
  });
};

function clearData(cb) {
  users.clear();
  params.clear();
  paramLists.clear();

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
      let prmNames = [];
      if (prmList.paramNames) {
        prmNames = prmList.paramNames.split(',');
      }
      prmNames.forEach((prmName) => {
        if (!params.has(prmName)) {
          setError(`cannot find param "${prmName}" in "${prmList.name}"`);
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

function loadParamListsFromNodesModel(cb) {
  const lists = myDataModelNodes.GetParamsListsForEachPS();

  for (let i = 0; i < lists.length; i += 1) {
    const prmList = lists[i];
    for (let j = 0; j < prmList.paramNames.length; j += 1) {
      const prmName = prmList.paramNames[j];
      if (!params.has(prmName)) {
        setError(`cannot find param "${prmName}" in "${prmList.name}"`);
      }
    }
    paramLists.set(prmList.name, prmList);
  }

  return cb();
}

function makeListNamesForEachParam(cb) {
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

const getParam = paramName => params.get(paramName);
const getAllParamsAsArray = () => Array.from(params.values());

const getParamsOfList = (paramListName) => {
  const paramList = paramLists.get(paramListName);
  if (paramList) {
    const resultParams = [];
    const locParams = paramList.paramNames;// .split(',');
    locParams.forEach((prmName) => {
      const param = params.get(prmName);
      if (param) {
        resultParams.push(param);
      } else {
        setError(`cannot find param "${prmName}" in "${paramList.name}"`);
      }
    });
    return resultParams;
  }
  return [];
};

const getParamsList = paramListName => paramLists.get(paramListName);

const getAvailableParamsLists = (userName) => {
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
module.exports.getParam = getParam;
module.exports.getAllParamsAsArray = getAllParamsAsArray;
module.exports.getParamsOfList = getParamsOfList;
module.exports.getParamsList = getParamsList;
module.exports.getAvailableParamsLists = getAvailableParamsLists;

