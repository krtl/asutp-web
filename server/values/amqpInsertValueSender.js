/* eslint max-len: ["error", { "code": 300 }] */
const config = require('../../config');
const MyDataModelParams = require('../models/myDataModelParams');
// const dbValues = require('./dbValues');
const amqpSender = require('../amqp/amqp_send');
// const logger = require('../logger');
const moment = require('moment');

amqpSender.start(config.amqpUri);

const trackDbParamValue = (newParamValue) => {
  const param = MyDataModelParams.GetParam(newParamValue.paramName);
  if (param !== undefined) {
    if (param.trackAllChanges) {
      const dt = moment(newParamValue.dt).format('YYYY-MM-DD HH:mm:ss');
      const s = `${newParamValue.paramName}<>${newParamValue.value}<>${newParamValue.qd}<>${dt}`;
      amqpSender.send(config.amqpInsertValuesQueueName, s);

        // dbValues.saveValue(newParamValue);
    }
  }
};

module.exports.trackDbParamValue = trackDbParamValue;

