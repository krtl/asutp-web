process.env.LOGGER_NAME = 'dbInsertor';
const logger = require('../logger');
const mongoose = require('mongoose');
const config = require('../../config');
const MyDataModelParams = require('../models/myDataModelParams');
const MyParamValue = require('../models/myParamValue');
const MyNodeStateValue = require('../models/myNodeStateValue');
const amqpValuesReceiver = require('../amqp/amqp_receive');
const amqpNodeStateReceiver = require('../amqp/amqp_receive');
const DbValuesTracker = require('./dbValuesTracker');
const HalfHourValuesTracker = require('./halfHourValuesTracker');
// const moment = require('moment');


mongoose.Promise = global.Promise;

mongoose.connect(config.dbUri, {
  useMongoClient: true,
  autoIndex: process.env.NODE_ENV !== 'production',
});

const db = mongoose.connection;
db.on('error', logger.error.bind(logger, 'connection error'));
db.on('connected', () => {
  logger.info(`We are connected to ${config.dbUri}`);
  MyDataModelParams.LoadFromDB((err) => {
    if (err) {
      logger.error(`Failed! Error: ${err}`);
    } else {
      // logger.info('Done!');
      HalfHourValuesTracker.loadLastTrackedValues((err) => {
        if (err) {
          logger.error(`Failed! Error: ${err}`);
        } else {
          amqpValuesReceiver.start(config.amqpUri, config.amqpInsertValuesQueueName, (received) => {
            logger.debug('[] Got msg', received);

                // paramName<>55,63<>NA<>2017-11-17 10:05:44.132
            const s = received.split('<>');
            if (s.length === 4) {
              const dt = new Date(s[3]);
              const float = parseFloat(s[1].replace(',', '.'));
              const obj = new MyParamValue(s[0], float, dt, s[2]);

              DbValuesTracker.trackDbParamValue(obj);
            } else {
              logger.error('[][MyParamValue] Failed to parse: ', received);
            }
          });

          amqpNodeStateReceiver.start(config.amqpUri, config.amqpInsertNodeStateQueueName, (received) => {
            logger.debug('[] Got msg', received);

                // nodeName<>oldState<>newState<>2017-11-17 10:05:44.132
            const s = received.split('<>');
            if (s.length === 4) {
              const oldState = parseInt(s[1], 10);
              const newState = parseInt(s[2], 10);
              const dt = new Date(s[3]);
              const obj = new MyNodeStateValue(s[0], oldState, newState, dt);

              DbValuesTracker.trackDbNodeStateValue(obj);
            } else {
              logger.error('[][MyNodeStateValue] Failed to parse: ', received);
            }
          });
        }
      });
    }
  });
});


// mongoose.connection.close((err) => {
//     if (err) {
//       logger.info(`We are disconnected from db. Error: ${err}`);
//     } else {
//       logger.info('We are disconnected from db.');
//     }
//   });
// });
