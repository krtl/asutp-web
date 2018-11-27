const MyParamValue = require('../models/myParamValue');
const config = require('../../config');
const amqpReceiver = require('../amqp/amqp_receive');
const lastValues = require('../values/lastValues');
const logger = require('../logger');

lastValues.init(
     { useDbValueTracker: true });

amqpReceiver.start(config.amqpUri, config.amqpRawValuesQueueName, (received) => {
  logger.debug('[] Got msg', received);

      // paramName<>55,63<>NA<>2017-11-17 10:05:44.132
  const s = received.split('<>');
  if (s.length === 4) {
    const dt = new Date(s[3]);
    const float = parseFloat(s[1]);
    const obj = new MyParamValue(s[0], float, dt, s[2]);

    lastValues.setLastValue(obj);
  } else {
    logger.error('[][MyParamValue] Failed to parse: ', received);
  }
});

