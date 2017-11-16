const amqp = require('amqplib/callback_api');
process.env.CLOUDAMQP_URL = 'amqp://localhost';

// if the connection is closed or fails to be established at all, we will reconnect
let amqpConn = null;
function start() {
  amqp.connect(`${process.env.CLOUDAMQP_URL}?heartbeat=60`, (err, conn) => {
    if (err) {
      console.error('[AMQP]', err.message);
      return setTimeout(start, 7000);
    }
    conn.on('error', (err) => {
      if (err.message !== 'Connection closing') {
        console.error('[AMQP] conn error', err.message);
      }
    });
    conn.on('close', () => {
      console.error('[AMQP] reconnecting');
      return setTimeout(start, 7000);
    });

    console.log('[AMQP] connected');
    amqpConn = conn;

    whenConnected();
  });
}

function whenConnected() {
  startWorker();
}

// A worker that acks messages only if processed succesfully
function startWorker() {
  amqpConn.createChannel((err, ch) => {
    if (closeOnErr(err)) return;
    ch.on('error', (err) => {
      console.error('[AMQP] channel error', err.message);
    });
    ch.on('close', () => {
      console.log('[AMQP] channel closed');
    });
    ch.prefetch(10);
    ch.assertQueue('hello', { durable: true }, (err, _ok) => {
      if (closeOnErr(err)) return;
      ch.consume('hello', processMsg, { noAck: false });
      console.log('Worker is started');
    });

    function processMsg(msg) {
      const incomingDate = (new Date()).toISOString();
      console.log(`Msg [deliveryTag=${msg.fields.deliveryTag}] arrived at ${incomingDate}`);
      work(msg, (ok) => {
        console.log(`Sending Ack for msg at time ${incomingDate}`);
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
  console.log('Got msg', msg.content.toString());
  setTimeout(() => cb(true), process.env.WORK_WAIT_TIME || 12000);
}

function closeOnErr(err) {
  if (!err) return false;
  console.error('[AMQP] error', err);
  amqpConn.close();
  return true;
}

start();
