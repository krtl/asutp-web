/* eslint max-len: ["error", { "code": 300 }] */
const config = require('../../config');
const MyDataModelParams = require('../models/myDataModelParams');
const amqpSender = require('../amqp/amqp_send');
// const logger = require('../logger');
const moment = require('moment');

const Start = () => {
  amqpSender.start(config.amqpUri);
};

const TrackDbParamValue = (newParamValue) => {
  const param = MyDataModelParams.getParam(newParamValue.paramName);  // is that realy required??
  if (param !== undefined) {
    if ((param.trackAllChanges) || (param.trackAveragePerHour)) {
      const dt = moment(newParamValue.dt).format('YYYY-MM-DD HH:mm:ss');
      const s = `${newParamValue.paramName}<>${newParamValue.value}<>${newParamValue.qd}<>${dt}`;
      amqpSender.send(config.amqpInsertValuesQueueName, s);
    }
  }
};

module.exports.TrackDbParamValue = TrackDbParamValue;
module.exports.Start = Start;

