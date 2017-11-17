const amqp = require('amqplib/callback_api');
const lastValues = require('./lastValues');


process.env.CLOUDAMQP_URL = 'amqp://localhost';

// if the connection is closed or fails to be established at all, we will reconnect
let amqpConn = null;
let reconnectionStarted = false;
function start() {
  reconnectionStarted = false;
  amqp.connect(`${process.env.CLOUDAMQP_URL}?heartbeat=60`, (err, conn) => {
    if (err) {
      console.error('[AMQP]', err.message);
      if (!reconnectionStarted) {
        reconnectionStarted = true;
        setTimeout(start, 7000);
      }
      return;
    }
    conn.on('error', (err) => {
      if (err.message !== 'Connection closing') {
        console.error('[AMQP] conn error', err.message);
      }
    });
    conn.on('close', () => {
      if (!reconnectionStarted) {
        reconnectionStarted = true;
        setTimeout(start, 7000);
        console.error('[AMQP] reconnecting');
      }
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
    ch.assertQueue('asutp.values.queue', { durable: true }, (err, _ok) => {
      if (closeOnErr(err)) return;
      ch.consume('asutp.values.queue', processMsg, { noAck: false });
      console.log('Worker is started');
    });

    function processMsg(msg) {
      const incomingDate = (new Date()).toISOString();
      // console.log(`Msg [deliveryTag=${msg.fields.deliveryTag}] arrived at ${incomingDate}`);
      work(msg, (ok) => {
        // console.log(`Sending Ack for msg at time ${incomingDate}`);
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

  // paramName<>55,63<>NA<>2017-11-17 10:05:44.132
  const s = msg.content.toString().split('<>');
  if (s.length === 4) {
    const obj = { paramName: s[0], value: s[1], qd: s[2], dt: s[3] };
    lastValues.SetLastValue(obj);
  } else {
    console.error('[ParamValue] Failed to parse: ', msg.content.toString());
  }

  cb(true);
}

function closeOnErr(err) {
  if (!err) return false;
  console.error('[AMQP] error', err);
  amqpConn.close();
  return true;
}

start();
