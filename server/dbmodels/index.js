const mongoose = require('mongoose');
const logger = require('../logger');
const myDataModel = require('../models/myDataModel');


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
      myDataModel.LoadFromDB();
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
  require('./netNode');// eslint-disable-line global-require
  require('./netNodeLep');// eslint-disable-line global-require
  require('./netNodePS');// eslint-disable-line global-require
  require('./netNodeSection');// eslint-disable-line global-require
  require('./netNodeCell');// eslint-disable-line global-require
  require('./netNodeTransformer');// eslint-disable-line global-require
  require('./netWire');// eslint-disable-line global-require
};
