// const WebSocket = require('ws');
const randomstring = require('randomstring');
const logger = require('../logger');

const traceMessages = true;
const heartBeatTimeout = 30; //sec

let wss;
let timerId;

function clientConnect(ws) {
  ws.isAlive = true;
  ws.id = randomstring.generate(15);
  ws.timeToPing = heartBeatTimeout;
  // ..
}

function clientReceive(ws, s) {
  ws.timeToPing = heartBeatTimeout;
  if (traceMessages) {
    logger.verbose(`[WS]client ${ws.id} received: ${s}`);
  }
}

function clientSend(ws, s) {
  try {
    ws.send(s);
    if (traceMessages) {
      logger.verbose(`[WS]client ${ws.id} sent: ${s}`);
    }
  } catch (e) { logger.warn(`[WS] exception on WebSocket send: ${e.message}`); }
}

function processCommand(ws, s) {
  if (s.startsWith('echo: ')) {
    return s.replace('echo: ', '');
  } else if (s.startsWith('paramsListName: ')) {
    if (true) {
      ws.paramsListName = s.replace('paramsListName: ', '');
      return 'ack';
    }

    return 'nack: Unknown paramsListName';
  }

  return '';
}

const initializeWebSocketServer = function (webSocket) {
  wss = webSocket;

  wss.on('connection', (ws, req) => {
    const ip = req.connection.remoteAddress;
    clientConnect(ws);
    logger.info(`[WS]client ${ws.id} connected from ${ip}`);


    ws.on('pong', () => {
      ws.isAlive = true;
      ws.timeToPing = heartBeatTimeout;
      if (traceMessages) {
        logger.debug(`[WS]client ${ws.id} received pong`);
      }
    });

    ws.on('message', (message) => {
      clientReceive(ws, message);

      const s = processCommand(ws, message);
      if (s !== '') {
        clientSend(ws, s);
      }
    });

    // clientSend(ws, 'Hi there, I am ASUTP-WebSocket server');
  });

  wss.on('error', (err) => {
    logger.warn(`[WS] error on WebSocketServer: ${err}`);
  });

  wss.on('listening', () => {
    logger.info('[WS] WebSocketServer started to listen.');
  });

  timerId = setInterval(() => {
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

const finalizeWebSocketServer = function () {
  clearInterval(timerId);
};


module.exports.initializeWebSocketServer = initializeWebSocketServer;
module.exports.finalizeWebSocketServer = finalizeWebSocketServer;
