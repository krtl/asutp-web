const async = require('async');
const moment = require('moment');

const DbParam = require('../dbmodels/param');  // eslint-disable-line global-require

const logger = require('../logger');
const MyParam = require('../models/myParam');
// const MyParamValue = require('./myParamValue');

const params = new Map();

let errs = 0;
function setError(text) {
  errs += 1;
  logger.error(`[ModelParams] ${text}`);
}

process
.on('unhandledRejection', (reason, p) => {
  const s = `Unhandled Rejection at Promise: ${reason}  ${p}`;
  setError(s);
  // eslint-disable-next-line no-console
  console.error(s);
  process.exit(1);
})
.on('uncaughtException', (err) => {
  const s = `Uncaught Exception thrown: ${err.message} \r\n callstack: ${err.stack}`;
  setError(s);
  // eslint-disable-next-line no-console
  console.error(s);
  process.exit(1);
});

const LoadFromDB = (cb) => {
  const start = moment();
  async.series([
    clearData,
    loadParams,
  ], () => {
    let res = null;
    if (errs === 0) {
      const duration = moment().diff(start);
      logger.info(`[ModelParams] loaded from DB with ${params.size} Params in ${moment(duration).format('mm:ss.SSS')}`);
    } else {
      res = `loading params failed with ${errs} errors!`;
      logger.error(res);
    }
    return cb(res);
  });
};

function clearData(cb) {
  params.clear();

  return cb();
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

const getParam = paramName => params.get(paramName);
const getAllParamsAsArray = () => Array.from(params.values());


module.exports.LoadFromDB = LoadFromDB;
module.exports.getParam = getParam;
module.exports.getAllParamsAsArray = getAllParamsAsArray;

