process.env.LOGGER_NAME = 'serviceLogger';
process.env.LOGGER_LEVEL = 'info';

const logger = require('../logger_to_file');
const loggerStarter = require('./logger');
const config = require('../../config');
const amqpServiceLoggsReceiver = require('./amqp_receive');


const loggers = new Map();

logger.info('serviceLogger is started.');


amqpServiceLoggsReceiver.start(config.amqpUri, config.amqpServiceLoggsQueueName, (received) => {
  logger.verbose('[LoggsReceiver] Got msg', received);

  // loggerName<|>info<|>2017-11-17 10:05:44.132<|>message

  const s = received.split('<|>');
  if (s.length === 4) {
    const loggerName = s[0];
    const level = s[1];
    const dt = s[2];
    const mess = s[3];

    let locLogger;
    if (loggers.has(loggerName)) {
      locLogger = loggers.get(loggerName);
    } else {
      locLogger = loggerStarter.Start({ name: loggerName, level: 'debug', timestamp: false });
      loggers.set(loggerName, locLogger);
    }

    switch (level) {
      case 'error': {
        locLogger.error(`${dt} ${mess}`);
        break;
      }
      case 'warn': {
        locLogger.warn(`${dt} ${mess}`);
        break;
      }
      case 'info': {
        locLogger.info(`${dt} ${mess}`);
        break;
      }
      case 'debug': {
        locLogger.debug(`${dt} ${mess}`);
        break;
      }
      case 'verbose': {
        locLogger.verbose(`${dt} ${mess}`);
        break;
      }
      default: locLogger.silly(`${dt} ${mess}`);
    }
      //  ...
  } else {
    logger.error('[LoggsReceiver] Failed to parse: ', received);
  }
});

