const WebSocket = require('ws');

let wss;

const InitWebSocketServer = function (httpServer) {
// initialize the WebSocket server instance
  wss = new WebSocket.Server({ httpServer });

  wss.on('connection', (ws, req) => {
    // connection is up, let's add a simple simple event

    const ip = req.connection.remoteAddress;
    console.log('connection : %s', ip);

    ws.on('message', (message) => {
      // log the received message and send it back to the client
      console.log('received: %s', message);
      ws.send(`Hello, you sent -> ${message}`);
    });

    // send immediatly a feedback to the incoming connection
    ws.send('Hi there, I am a WebSocket server');
  });
};


module.exports.InitWebSocketServer = InitWebSocketServer;
