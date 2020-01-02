const winston = require("winston");
const config = require("../../config");

const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  // return `${timestamp} [${level}] ${message}`;
  return `${message}`;
});

const Start = sets => {
  const logger = winston.createLogger({
    level: sets.level,
    // format: winston.format.json(),
    json: false,
    timestamp: sets.timestamp,

    format: combine(
      // winston.format.timestamp({
      //   format: "YYYY-MM-DD HH:mm:ss.SSS"
      // }),
      myFormat
    ),

    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log`
      // - Write all logs error (and below) to `error.log`.
      //
      new winston.transports.File({
        name: "error-file",
        filename: `${config.logsFolderName}/${sets.name}_errors.log`,
        level: "error",
        maxsize: 50000000,
        maxFiles: 20,
        json: false
      }),

      new winston.transports.File({
        name: "combined-file",
        filename: `${config.logsFolderName}/${sets.name}.log`,
        maxsize: 50000000,
        maxFiles: 20,
        json: false
      })

      //   new (winston.transports.Console)({
      //     name: 'console',
      //     colorize: true,
      //     timestamp: myTimeStamp,
      //     formatter: myFormatter,
      //     json: false,
      //   }),
    ],

    exceptionHandlers: [
      new winston.transports.File({
        name: "exception-file",
        filename: `${config.logsFolderName}/${sets.name}_exceptions.log`,
        maxsize: 50000000,
        maxFiles: 20,
        json: false,
        handleExceptions: true,
        humanReadableUnhandledException: true
      })
    ]
  });

  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  //
  if (process.env.NODE_ENV !== "production") {
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

module.exports.Start = Start;
