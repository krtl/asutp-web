// const WebSocket = require('ws');
const randomstring = require('randomstring');
const logger = require('../logger');

const traceMessages = true;

let wss;

function clientConnect(ws) {
  ws.isAlive = true;
  ws.id = randomstring.generate(15);
  ws.timeToPing = 10;
  // ..
}

function clientReceive(ws, s) {
  ws.timeToPing = 10;
  if (traceMessages) {
    logger.verbose(`[WS]client ${ws.id} received: ${s}`);
  }
/*  if (s.startWith('paramsList ')) {


    // ws.paramsList =
  }*/
}

function clientSend(ws, s) {
  try {
    ws.send(s);
    if (traceMessages) {
      logger.verbose(`[WS]client ${ws.id} sent: ${s}`);
    }
  } catch (e) { logger.warn(`[WS] exception on WebSocket send: ${e.message}`); }
}

const InitWebSocketServer = function (webSocket) {
  wss = webSocket;

  wss.on('connection', (ws, req) => {
    const ip = req.connection.remoteAddress;
    clientConnect(ws);
    logger.info(`[WS]client ${ws.id} connected from ${ip}`);


    ws.on('pong', () => {
      ws.isAlive = true;
      ws.timeToPing = 10;
      if (traceMessages) {
        logger.debug(`[WS]client ${ws.id} received pong`);
      }
    });

    ws.on('message', (message) => {
      clientReceive(ws, message);

      clientSend(ws, `Hello, you sent -> ${message}`);
    });

    clientSend(ws, 'Hi there, I am ASUTP-WebSocket server');
  });

  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();

      if (ws.timeToPing > 0) ws.timeToPing -= 1;

      if (ws.timeToPing === 0) {
        ws.isAlive = false;
        ws.ping('', false, true);
        if (traceMessages) {
          logger.debug(`[WS]client ${ws.id} sent: ping`);
        }
      }
    });
  }, 10000);
};


module.exports.InitWebSocketServer = InitWebSocketServer;
