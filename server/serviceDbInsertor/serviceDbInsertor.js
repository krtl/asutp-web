process.env.LOGGER_NAME = 'serviceDbInsertor';
process.env.LOGGER_LEVEL = 'info';

const logger = require('../logger');
const amqpLogSender = require('../amqp/amqp_send');

logger.setup({ amqpSender: amqpLogSender });

const moment = require('moment');
const mongoose = require('mongoose');
const config = require('../../config');
const MyDataModelParams = require('./myDataModelParams');
const MyParamValue = require('../models/myParamValue');
const MyNodeStateValue = require('../models/myNodeStateValue');
const amqpValuesReceiver = require('../amqp/amqp_receive');
const amqpNodeStateReceiver = require('../amqp/amqp_receive1');
const DbValuesTracker = require('./dbValuesTracker');
const HalfHourValuesTracker = require('./halfHourValuesTracker');


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
            logger.verbose(`[ValuesReceiver] Got msg ${received}`);

            // paramName<>55,63<>NA<>2017-11-17 10:05:44.132
            const s = received.split('<>');
            if (s.length === 4) {
              const momentDT = moment(s[3]);
              const dt = new Date(momentDT);
              const float = parseFloat(s[1].replace(',', '.'));
              const obj = new MyParamValue(s[0], float, dt, s[2]);

              DbValuesTracker.trackDbParamValue(obj);
            } else {
              logger.error(`[ValuesReceiver][MyParamValue] Failed to parse: ${received}`);
            }
          });

          // should be remaked!

          amqpNodeStateReceiver.start(config.amqpUri, config.amqpInsertNodeStateQueueName, (received) => {
            logger.verbose(`[NodeStateReceiver] Got msg ${received}`);

                // nodeName<>oldState<>newState<>2017-11-17 10:05:44.132
            const s = received.split('<>');
            if (s.length === 4) {
              const oldState = parseInt(s[1], 10);
              const newState = parseInt(s[2], 10);
              const momentDT = moment(s[3]);
              const dt = new Date(momentDT);
              const obj = new MyNodeStateValue(s[0], oldState, newState, dt);

              DbValuesTracker.trackDbNodeStateValue(obj);
            } else {
              logger.error(`[NodeStateReceiver][MyNodeStateValue] Failed to parse: ${received}`);
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
