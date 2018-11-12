const mongoose = require('mongoose');
const logger = require('../logger');
const myDataModelParams = require('../models/myDataModelParams');


module.exports.connect = (uri, useDataModel) => {
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
      myDataModelParams.LoadFromDB();
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
  // require('./netNode__');// eslint-disable-line global-require
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
  require('./nodeEquipment');// eslint-disable-line global-require
};
