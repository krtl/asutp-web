process.env.LOGGER_NAME = "server";
process.env.LOGGER_LEVEL = "debug";
process.env.NODE_ENV = "production";

const logger = require("./server/logger");
const amqpLogSender = require("./server/amqp/amqp_send");

logger.setup({ amqpSender: amqpLogSender });

logger.info("[] Starting ...");

const express = require("express");
const mongoose = require("mongoose");
const http = require("http");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const config = require("./config");
const routeUsers = require("./server/routes/users");
const routeProjects = require("./server/routes/projects");
const MyStompServer = require("./server/coreServer/myStompServer");
const dbModels = require("./server/dbmodels");
// const paramValuesProcessor = require('./server/values/paramValuesProcessor');
const commandsServer = require("./server/coreServer/commandsServer");

require("http-shutdown").extend();

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
// connect to the database and load models
dbModels.connect(config.dbUri, true, err => {
  if (err) {
    // eslint-disable-next-line no-console
    console.error(`dbModels connection error: ${err}`);
    process.exit(1);
  }
  // start listening only after models has loaded.
  // ...
});

const app = express();

// initialize a simple http httpserver
const httpserver = http.createServer(app).withShutdown();

// tell the app to look for static files in these directories
// app.use(express.static('./static/bla-bla/'));

// tell the app to parse HTTP body messages
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// pass the passport middleware
app.use(passport.initialize());

// load passport strategies
const localSignupStrategy = require("./server/passport/local-signup");
const localLoginStrategy = require("./server/passport/local-login");

passport.use("local-signup", localSignupStrategy);
passport.use("local-login", localLoginStrategy);

// pass the authorization checker middleware
const authCheckMiddleware = require("./server/middleware/auth-check");

app.use("/api", authCheckMiddleware);

// routes
const authRoutes = require("./server/routes/auth");
const apiRoutes = require("./server/routes/api");

app.use("/auth", authRoutes);
app.use("/api", apiRoutes);

routeProjects(app);
routeUsers(app);

// port
app.set("port", process.env.PORT || 3001);
// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
  app.use(express.static(path.join(__dirname, "client/build")));
  app.get("/*", function(req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}

const httpErrorMiddleware = require("./server/middleware/sendHttpError");

app.use(httpErrorMiddleware);

app.use((req, res) => {
  res.sendStatus(404);
});

MyStompServer.initializeStompServer(httpserver);

// start the httpserver
// app.listen(app.get('port'), () => {
httpserver.listen(app.get("port"), () => {
  // logger.info('Server is running on http://localhost:3000 or http://127.0.0.1:3000');
  logger.info(`Http server listening at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});

const { fork } = require("child_process");

const forked = fork("backgroundworker.js");

forked.on("message", msg => {
  // console.log("Message from background: ", msg);
  const err = commandsServer.processReceivedCommand(msg);
  if (err) {
    console.log(err.message, msg);
  }
});
forked.on("exit", function(code, signal) {
  console.log(
    "child process exited with " + `code ${code} and signal ${signal}`
  );
});

commandsServer.initialize(forked);

//forked.send({ hello: 'world' });

// process.on('beforeExit', () => {
//   logger.info('[] OnBeforeExit ...');
// });

// process.on('exit', () => {
//   logger.info('[] OnExit ...');
//   // paramValuesProcessor.finalizeParamValuesProcessor();
// });

process.on("SIGINT", () => {
  logger.info("[] Stopping ...");
  httpserver.shutdown(() => {
    // httpserver.close((err) => {
    //   if (err) {
    //   // eslint-disable-next-line no-console
    //   console.error(`Error on close HttpServer: ${err}`);
    //   process.exit(1);
    // }
    mongoose.connection.close(err => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error(`Error on close Mongoose connection: ${err}`);
        process.exit(1);
      }
      // eslint-disable-next-line no-console
      console.log("Mongoose connection disconnected");
      if (forked.connected) forked.disconnect();

      amqpLogSender.stop();
      // eslint-disable-next-line no-console
      console.log("amqpLogSender closed.");
    });
  });

  // paramValuesProcessor.finalizeParamValuesProcessor();
});
