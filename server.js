
process.env.LOGGER_NAME = 'server';
// process.env.LOGGER_LEVEL = 'debug';

const logger = require('./server/logger');
const amqpLogSender = require('./server/amqp/amqp_send');

logger.setup({ amqpSender: amqpLogSender });

const express = require('express');
// const mongoose = require('mongoose');
const http = require('http');
const bodyParser = require('body-parser');
const passport = require('passport');
const config = require('./config');
const routeUsers = require('./server/routes/users');
const routeProjects = require('./server/routes/projects');
const MyStompServer = require('./server/values/myStompServer');
const dbModels = require('./server/dbmodels');

// process.env.NODE_ENV = 'production';

// connect to the database and load models
dbModels.connect(config.dbUri, true, (err) => {
  if (err) {
    process.exit(2);
  }
  // start listening only after models has loaded.
  // ...
});

const app = express();

// initialize a simple http httpserver
const httpserver = http.createServer(app);


// tell the app to look for static files in these directories
app.use(express.static('./httpserver/static/'));
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

routeProjects(app);
routeUsers(app);

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


MyStompServer.initializeStompServer(httpserver);

// start the httpserver
// app.listen(app.get('port'), () => {
httpserver.listen(app.get('port'), () => {
  // logger.info('Server is running on http://localhost:3000 or http://127.0.0.1:3000');
  logger.info(`Http server listening at: http://localhost:${app.get('port')}/`); // eslint-disable-line no-console
});

// process.on('exit', code => logger.log(`About to exit with code ${code}`));

// // graceful shutdown
// process.on('SIGTERM', () => {
//   logger.info('SIGTERM signal received.');
//   logger.log('Closing http server.');
//   httpserver.close(() => {
//     logger.log('Http server closed.');
//     // boolean means [force], see in mongoose doc
//     mongoose.connection.close(false, () => {
//       logger.log('MongoDb connection closed.');
//       process.exit(0);
//     });
//   });
// });

process.stdin.resume(); // so the program will not close instantly

function exitHandler(options, exitCode) {
  if (options.cleanup) logger.log('clean');
  if (exitCode || exitCode === 0) logger.log(exitCode);
  if (options.exit) process.exit();
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, { cleanup: true }));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, { exit: true }));

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler.bind(null, { exit: true }));
process.on('SIGUSR2', exitHandler.bind(null, { exit: true }));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, { exit: true }));
