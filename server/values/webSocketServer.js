//const WebSocket = require('ws');
const logger = require('../logger');

let wss;

const InitWebSocketServer = function (webSocket) {
  wss = webSocket;

  wss.on('connection', (ws, req) => {
    const ip = req.connection.remoteAddress;
    ws.isAlive = true;
    ws.id = Math.random();
    ws.timeToPing = 10;

    logger.info(`client ${ws.id} connected from ${ip}`);


    ws.on('pong', () => {
      ws.isAlive = true;
      ws.timeToPing = 10;
      logger.info(`client ${ws.id} received pong`);
    });

    ws.on('message', (message) => {
      ws.timeToPing = 10;
      // log the received message and send it back to the client
      logger.info(`client ${ws.id} received: ${message}`);
      try {
        ws.send(`Hello, you sent -> ${message}`);
        logger.info(`client ${ws.id} sent 'Hello, you sent -> ${message}`);
      } catch (e) { logger.warn(`exception on WebSocket send: ${e.message}`); }
    });

    // send immediatly a feedback to the incoming connection
    ws.send('Hi there, I am a WebSocket server');
    logger.info(`client ${ws.id} sent: Hi there, I am a WebSocket server`);
  });

  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();

      if (ws.timeToPing > 0) ws.timeToPing -= 1;

      if (ws.timeToPing === 0) {
        ws.isAlive = false;
        ws.ping('', false, true);
        logger.info(`client ${ws.id} sent: ping`);
      }
    });
  }, 10000);
};


module.exports.InitWebSocketServer = InitWebSocketServer;
