const async = require('async');

// const DbParam = require('mongoose').model('Param');
// const DbParamList = require('mongoose').model('ParamList');

let DbNode;
let DbNodeRES;
let DbNodeLEP;
let DbNodePS;
let DbNodePSPart;
let DbNodeTransformer;
let DbNodeSection;
let DbNodeConnector;
let DbNodeEquipment;


const logger = require('../logger');

let MyNode = require('./myNode');
let MyNodeRES = require('./myNodeRES');
let MyNodeLEP = require('./myNodeLEP');
let MyNodePS = require('./myNodePS');
let MyNodePSPart = require('./myNodePSPart');
let MyNodeTransformer = require('./myNodeTransformer');
let MyNodeSection = require('./myNodeSection');
let MyNodeConnector = require('./myNodeConnector');
let MyNodeEquipment = require('./myNodeEquipment');

const nodes = new Map();

const LoadFromDB = (cb) => {
  async.series([
    clearData,
    loadNodes,
    loadNodeRESs,
    loadNodeLEPs,
    loadNodePSs,
    loadNodePSParts,
    loadNodeSections,
    loadNodeTransformers,
    loadNodeConnectors,
    loadNodeEquipments,
    linkData,
    checkData,
  ], (err) => {
    if (err) {
      logger.error(`[sever] failed to load params: ${err}`);
      return cb(err);
    }
    logger.info(`[sever] loaded from DB with ${nodes.size} Nodes.`);
    return cb('');
  });
};

function clearData(cb) {
  nodes.clear();

  DbNode = require('mongoose').model('Node');  // eslint-disable-line global-require
  DbNodeRES = require('mongoose').model('NodeRES');  // eslint-disable-line global-require
  DbNodeLEP = require('mongoose').model('NodeLEP');  // eslint-disable-line global-require
  DbNodePS = require('mongoose').model('NodePS');  // eslint-disable-line global-require
  DbNodePSPart = require('mongoose').model('NodePSPart');  // eslint-disable-line global-require
  DbNodeTransformer = require('mongoose').model('NodeTransformer');  // eslint-disable-line global-require
  DbNodeSection = require('mongoose').model('NodeSection');  // eslint-disable-line global-require
  DbNodeConnector = require('mongoose').model('NodeConnector');  // eslint-disable-line global-require
  DbNodeEquipment = require('mongoose').model('NodeEquipment');  // eslint-disable-line global-require

  return cb();
}

function loadNodes(cb) {
  DbNode.find({}, null, { sort: { name: 1 } }, (err, locNodes) => {
    if (err) return cb(err);
    locNodes.forEach((usr) => {
      !!
      nodes.set(usr.name, usr.might);
    });
    return cb();
  });
}

function loadNodeRESs(cb) {
  DbNodeRES.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) return cb(err);
    prms.forEach((prm) => {
      const p = new MyNodeRES(prm.name,
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
