/* eslint max-len: ["error", { "code": 300 }] */
const config = require('../config');
// const amqpSender = require('./amqp/amqp_send');
// const logger = require('../logger');
const moment = require('moment');

let amqpSender;

if (!process.env.LOGGER_NAME) {
  process.env.LOGGER_NAME = 'defaul';
}
if (!process.env.LOGGER_LEVEL) {
  process.env.LOGGER_LEVEL = 'info';
}

const amqpSend = (level, message) => {
  if (amqpSender) {
    const dt = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    const s = `${process.env.LOGGER_NAME}<|>${level}<|>${dt}<|>${message}`;
    amqpSender.send(config.amqpServiceLoggsQueueName, s);
  }
};

const error = (message) => {
  amqpSend('error', message);
};
const warn = (message) => {
  amqpSend('warn', message);
};

const info = (message) => {
  amqpSend('info', message);
};

const debug = (message) => {
  if (process.env.LOGGER_LEVEL === 'debug') {
    amqpSend('debug', message);
  }
};

const verbose = (message) => {
  if (process.env.LOGGER_LEVEL === 'verbose') {
    amqpSend('verbose', message);
  }
};

const setup = (setts) => {
  amqpSender = setts.amqpSender;
  amqpSender.start(config.amqpUri);
};

module.exports = { error, warn, info, debug, verbose, setup };
