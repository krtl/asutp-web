const mongoose = require('mongoose');
const logger = require('../logger');
const myDataModelParams = require('../models/myDataModelParams');
const myDataModelNodes = require('../models/myDataModelNodes');
const paramValuesProcessor = require('../values/paramValuesProcessor');


module.exports.connect = (uri, useDataModel, callback) => {
  // mongoose.connect(uri);
  mongoose.connect(uri, {
    useMongoClient: true,
    autoIndex: process.env.NODE_ENV !== 'production',
  });

  // plug in the promise library:
  mongoose.Promise = global.Promise;

  mongoose.connection.on('connected', () => {
    logger.info(`Mongoose connection opened to ${uri}`);

    if (useDataModel) {
      myDataModelNodes.LoadFromDB((err) => {
        if (err) {
          if (callback) callback(err);
          return;
        }
        myDataModelParams.LoadFromDB((err) => {
          if (!err) {
            paramValuesProcessor.initializeParamValuesProcessor();
          }
          if (callback) callback(err);
        });
      });
    }
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`Mongoose connection error: ${err}`);
    process.exit(1);
  });

  mongoose.connection.on('disconnected', () => {
    logger.info('Mongoose default connection disconnected');
  });

  // load models
  require('./authUser');// eslint-disable-line global-require
  require('./param');// eslint-disable-line global-require
  require('./paramList');// eslint-disable-line global-require
  require('./paramValue');// eslint-disable-line global-require
  require('./paramHalfHourValue');// eslint-disable-line global-require

  require('./asutpConnection');// eslint-disable-line global-require

  require('./netNode');// eslint-disable-line global-require
  require('./netWire');// eslint-disable-line global-require

  require('./node');// eslint-disable-line global-require
  require('./nodeRegion');// eslint-disable-line global-require
  require('./nodeLEP');// eslint-disable-line global-require
  require('./nodeLEPConnection');// eslint-disable-line global-require
  require('./nodePS');// eslint-disable-line global-require
  require('./nodePSPart');// eslint-disable-line global-require
  require('./nodeTransformer');// eslint-disable-line global-require
  require('./nodeTransformerConnector');// eslint-disable-line global-require
  require('./nodeSection');// eslint-disable-line global-require
  require('./nodeSectionConnector');// eslint-disable-line global-require
  require('./nodeSec2SecConnector');// eslint-disable-line global-require
  require('./nodeEquipment');// eslint-disable-line global-require

  require('./nodeParamLinkage');// eslint-disable-line global-require

  require('./nodeStateValue');// eslint-disable-line global-require
};
