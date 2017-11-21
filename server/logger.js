const moment = require('moment');
const winston = require('winston');

function myTimeStamp() {
  return moment().format('YYYY-MM-DD HH:mm:ss.ms');
}

function myFormatter(options) {
  return `${options.timestamp()} [${options.level.toUpperCase()}] ${
    options.message ? options.message : ''
    }`;
}

const logger = new winston.Logger({
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
      filename: 'logs/errors.log',
      level: 'error',
      timestamp: myTimeStamp,
      formatter: myFormatter,
      maxFiles: 10,
      json: false,
    }),

    new winston.transports.File({
      name: 'combined-file',
      filename: 'logs/combined.log',
      timestamp: myTimeStamp,
      formatter: myFormatter,
      maxFiles: 10,
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
      filename: 'logs/exceptions.log',
      timestamp: myTimeStamp,
      maxFiles: 10,
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

// throw new Error('Hello, winston!');

module.exports = logger;
