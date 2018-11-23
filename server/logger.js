const moment = require('moment');
const winston = require('winston');

let logger;

if (process.env.LOGGER_NAME === '') {
  process.env.LOGGER_NAME = 'defaul';
}

function myTimeStamp() {
  return moment().format('YYYY-MM-DD HH:mm:ss.ms');
}

function myFormatter(options) {
  return `${options.timestamp()} [${options.level.toUpperCase()}] ${
    options.message ? options.message : ''
    }`;
}

const init = () => {
  logger = new winston.Logger({
    level: 'debug',
  // format: winston.format.json(),
    json: false,
    timestamp: true,
    transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
      new winston.transports.File({
        name: 'error-file',
        filename: `logs/${process.env.LOGGER_NAME}_errors.log`,
        level: 'error',
        timestamp: myTimeStamp,
        formatter: myFormatter,
        maxsize: 50000000,
        maxFiles: 20,
        json: false,
      }),

      new winston.transports.File({
        name: 'combined-file',
        filename: `logs/${process.env.LOGGER_NAME}_combined.log`,
        timestamp: myTimeStamp,
        formatter: myFormatter,
        maxsize: 50000000,
        maxFiles: 20,
        json: false,
      }),

      new (winston.transports.Console)({
        name: 'console',
        colorize: true,
        timestamp: myTimeStamp,
        formatter: myFormatter,
        json: false,
      }),
    ],

    exceptionHandlers: [
      new winston.transports.File({
        name: 'exception-file',
        filename: `logs/${process.env.LOGGER_NAME}_exceptions.log`,
        timestamp: myTimeStamp,
        maxsize: 50000000,
        maxFiles: 20,
        json: false,
        handleExceptions: true,
        humanReadableUnhandledException: true,
      }),
    ],
  });

// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
  if (process.env.NODE_ENV !== 'production') {
  // logger.add(
  // ..
  // );
  }


  logger.exitOnError = false;

// logger.info('test message!');

// logger.error('test error!');

// throw new Error('Hello, logger!');
  return logger;
};

if (logger === undefined) {
  logger = init();
}

module.exports = logger;

