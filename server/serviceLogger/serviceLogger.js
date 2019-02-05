process.env.LOGGER_NAME = 'serviceLogger';
process.env.LOGGER_LEVEL = 'info';

const logger = require('../logger_to_file');
const loggerStarter = require('./logger');
const config = require('../../config');
const amqpServiceLoggsReceiver = require('./amqp_receive');


const loggers = new Map();

logger.info('serviceLogger is started.');


amqpServiceLoggsReceiver.start(config.amqpUri, config.amqpServiceLoggsQueueName, (received) => {
  logger.debug('[] Got ServiceLoggs msg', received);

  // loggerName<>info<>2017-11-17 10:05:44.132<>message

  const s = received.split('<>');
  if (s.length === 4) {
    const loggerName = s[0];
    const level = s[1];
    const dt = s[2];
    const mess = s[3];

    let logger;
    if (loggers.has(loggerName)) {
      logger = loggers.get(loggerName);
    } else {
      logger = loggerStarter.Start({ name: loggerName, level, timestamp: true });
      loggers.set(loggerName, logger);
    }

    switch (level) {
      case 'error': {
        logger.error(`${dt} ${mess}`);
        break;
      }
      case 'warn': {
        logger.warn(`${dt} ${mess}`);
        break;
      }
      case 'info': {
        logger.info(`${dt} ${mess}`);
        break;
      }
      case 'debug': {
        logger.debug(`${dt} ${mess}`);
        break;
      }
      default: logger.silly(`${dt} ${mess}`);
    }
      //  ...
  } else {
    logger.error('[] Failed to parse: ', received);
  }
});

