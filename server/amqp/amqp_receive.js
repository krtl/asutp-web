const amqp = require('amqplib/callback_api');
const logger = require('../logger');
// const lastValues = require('./lastValues');
// const MyParamValue = require('../models/myParamValue');
// const config = require('../../config');


// process.env.CLOUDAMQP_URL = 'amqp://localhost';
let locAmpqURI = '';
let locAmqpValuesQueueName = '';
let locOnReceiveCallbackFunc = null;

// if the connection is closed or fails to be established at all, we will reconnect
let amqpConn = null;
let reconnectionStarted = false;
function start(ampqURI, amqpQueueName, onReceiveCallback) {
  if (ampqURI !== undefined) locAmpqURI = ampqURI;
  if (amqpQueueName !== undefined) locAmqpValuesQueueName = amqpQueueName;
  if (onReceiveCallback !== undefined) locOnReceiveCallbackFunc = onReceiveCallback;
  reconnectionStarted = false;
  amqp.connect(`${locAmpqURI}?heartbeat=60`, (err, conn) => {
    if (err) {
      logger.error(`[AMQP] ${err.message}`);
      if (!reconnectionStarted) {
        reconnectionStarted = true;
        setTimeout(start, 7000);
      }
      return;
    }
    conn.on('error', (err) => {
      if (err.message !== 'Connection closing') {
        logger.error(`[AMQP] conn error ${err.message}`);
      }
    });
    conn.on('close', () => {
      if (!reconnectionStarted) {
        reconnectionStarted = true;
        setTimeout(start, 7000);
        logger.error('[AMQP] reconnecting');
      }
    });

    logger.info('[AMQP] connected');
    amqpConn = conn;

    whenConnected();
  });
}

function whenConnected() {
  startWorker();
}

// A worker that acks messages only if processed successfully
function startWorker() {
  amqpConn.createChannel((err, ch) => {
    if (closeOnErr(err)) return;
    ch.on('error', (err) => {
      logger.error(`[AMQP] channel error ${err.message}`);
    });
    ch.on('close', () => {
      logger.info('[AMQP] channel closed');
    });
    ch.prefetch(10);
    ch.assertQueue(locAmqpValuesQueueName, { durable: true }, (err) => {
      if (closeOnErr(err)) return;
      ch.consume(locAmqpValuesQueueName, processMsg, { noAck: false });
      logger.info('[AMQP] Worker is started');
    });

    function processMsg(msg) {
      // const incomingDate = (new Date()).toISOString();
      // logger.info(`Msg [deliveryTag=${msg.fields.deliveryTag}] arrived at ${incomingDate}`);
      work(msg, (ok) => {
        // logger.info(`[AMQP] Sending Ack for msg at time ${incomingDate}`);
        try {
          if (ok) { ch.ack(msg); } else { ch.reject(msg, true); }
        } catch (e) {
          closeOnErr(e);
        }
      });
    }
  });
}

function work(msg, cb) {
  logger.verbose(`[AMQP] Got msg ${msg.content.toString()}`);

  if (locOnReceiveCallbackFunc != null) {
    locOnReceiveCallbackFunc(msg.content.toString());
  }

  cb(true);
}

function closeOnErr(err) {
  if (!err) return false;
  logger.error(`[AMQP] error ${err}`);
  amqpConn.close();
  return true;
}

module.exports.start = start;

