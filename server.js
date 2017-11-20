const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const passport = require('passport');
const config = require('./config');
const users = require('./server/routes/users');
const projects = require('./server/routes/projects');

// const WebSocketServer = require('./server/values/webSocketServer');

// connect to the database and load models
require('./server/models').connect(config.dbUri);

const app = express();

// initialize a simple http server
const server = http.createServer(app);


// tell the app to look for static files in these directories
app.use(express.static('./server/static/'));
app.use(express.static('./client/dist/'));
// tell the app to parse HTTP body messages
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// pass the passport middleware
app.use(passport.initialize());

// load passport strategies
const localSignupStrategy = require('./server/passport/local-signup');
const localLoginStrategy = require('./server/passport/local-login');
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

// pass the authorization checker middleware
const authCheckMiddleware = require('./server/middleware/auth-check');
app.use('/api', authCheckMiddleware);

// routes
const authRoutes = require('./server/routes/auth');
const apiRoutes = require('./server/routes/api');
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

projects(app);
users(app);

// port
app.set('port', process.env.PORT || 3001);
// Express only serves static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
}

const httpErrorMiddleware = require('./server/middleware/sendHttpError');
app.use(httpErrorMiddleware);

app.use((req, res) => {
  res.sendStatus(404);
});


// WebSocketServer.InitWebSocketServer(server);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  // connection is up, let's add a simple simple event

  const ip = req.connection.remoteAddress;
  console.log('connection : %s', ip);

  ws.isAlive = true;

  ws.on('pong', () => {
    ws.isAlive = true;
  });

  ws.on('message', (message) => {
    // log the received message and send it back to the client
    console.log('received: %s', message);
    try {
      ws.send(`Hello, you sent -> ${message}`);
    } catch (e) { console.warn(`exception on WebSocket send: ${e.message}`); }
  });

  // send immediatly a feedback to the incoming connection
  ws.send('Hi there, I am a WebSocket server');
});

setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping('', false, true);
  });
}, 30000);

// start the server
// app.listen(app.get('port'), () => {
server.listen(app.get('port'), () => {
  // console.log('Server is running on http://localhost:3000 or http://127.0.0.1:3000');
  console.log(`Find the server at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});

