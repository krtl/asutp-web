/* eslint max-len: ["error", { "code": 300 }] */
const config = require('../config');
const amqpSender = require('./amqp/amqp_send');
// const logger = require('../logger');
const moment = require('moment');

if (!process.env.LOGGER_NAME) {
  process.env.LOGGER_NAME = 'defaul';
}
if (!process.env.LOGGER_LEVEL) {
  process.env.LOGGER_LEVEL = 'info';
}

amqpSender.start(config.amqpUri);

const amqpSend = (level, message) => {
  const dt = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
  const s = `${process.env.LOGGER_NAME}<>${level}<>${dt}<>${message}`;
  amqpSender.send(config.amqpServiceLoggsQueueName, s);
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
  amqpSend('debug', message);
};

module.exports = { error, warn, info, debug };
