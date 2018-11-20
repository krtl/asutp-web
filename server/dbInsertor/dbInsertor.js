const mongoose = require('mongoose');
// const myDataModelParams = require('../models/myDataModelParams');
const MyParamValue = require('../models/myParamValue');
const config = require('../../config');
const amqpReceiver = require('../amqp/amqp_receive');
const dbValues = require('../values/dbValues');
// const moment = require('moment');
const logger = require('../logger');

mongoose.Promise = global.Promise;

mongoose.connect(config.dbUri, {
  useMongoClient: true,
  autoIndex: process.env.NODE_ENV !== 'production',
});

const db = mongoose.connection;
db.on('error', logger.error.bind(logger, 'connection error'));
db.on('connected', () => {
  logger.info(`We are connected to ${config.dbUri}`);
});

// myDataModelParams.LoadFromDB((err) => {
//   if (err) {
//     logger.error(`Failed! Error: ${err}`);
//   } else {
//     // logger.info('Done!');
//   }
// });


// lastValues.init(
//     { useDbValueTracker: false });

amqpReceiver.start(config.amqpUri, config.amqpInsertValuesQueueName, (received) => {
  logger.debug('[] Got msg', received);

      // paramName<>55,63<>NA<>2017-11-17 10:05:44.132
  const s = received.split('<>');
  if (s.length === 4) {
    const dt = new Date(s[3]);
    const obj = new MyParamValue(s[0], s[1], dt, s[2]);

    dbValues.saveValue(obj);
  } else {
    logger.error('[][MyParamValue] Failed to parse: ', received);
  }
});


// mongoose.connection.close((err) => {
//     if (err) {
//       logger.info(`We are disconnected from db. Error: ${err}`);
//     } else {
//       logger.info('We are disconnected from db.');
//     }
//   });
// });
