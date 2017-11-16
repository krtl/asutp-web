const amqp = require('amqplib');

amqp.connect('amqp://localhost').then(conn => conn.createChannel().then((ch) => {
  const q = 'hello';
  const msg = 'Hello World!';

  const ok = ch.assertQueue(q, { durable: true });

  return ok.then((_qok) => {
      // NB: `sentToQueue` and `publish` both return a boolean
      // indicating whether it's OK to send again straight away, or
      // (when `false`) that you should wait for the event `'drain'`
      // to fire before writing again. We're just doing the one write,
      // so we'll ignore it.
    ch.sendToQueue(q, Buffer.from(msg));
    console.log(" [x] Sent '%s'", msg);
    return ch.close();
  });
}).finally(() => { conn.close(); })).catch(console.warn);
