process.env.RECALCULATION = "recalculation";
process.env.LOGGER_NAME = "backgroundworker";
process.env.LOGGER_LEVEL = "debug";
process.env.NODE_ENV = "production";

const logger = require("./server/logger");
const amqpLogSender = require("./server/amqp/amqp_send");

logger.setup({ amqpSender: amqpLogSender });

logger.info("[] Starting ...");

const mongoose = require("mongoose");
const path = require("path");
const config = require("./config");
const dbModels = require("./server/dbmodels");
const paramValuesProcessor = require("./server/coreBackground/paramValuesProcessor");
const commandProcessor = require("./server/coreBackground/commandsBackground");

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

// process.on('beforeExit', () => {
//   logger.info('[] OnBeforeExit ...');
// });

// process.on('exit', () => {
//   logger.info('[] OnExit ...');
//   // paramValuesProcessor.finalizeParamValuesProcessor();
// });

process.on("SIGINT", () => {
  logger.info("[] Stopping ...");
  mongoose.connection.close(err => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error(`Error on close Mongoose connection: ${err}`);
      process.exit(1);
    }
    // eslint-disable-next-line no-console
    console.log("Mongoose connection disconnected");

    paramValuesProcessor.finalizeParamValuesProcessor();
    amqpLogSender.stop();
    // eslint-disable-next-line no-console
    console.log("amqpLogSender closed.");     
  });

});

process.on("message", msg => {
  // console.log("Message from parent:", msg);
  const err = commandProcessor.processReceivedCommand(msg);
  if (err) {
    console.log(err.message, msg);
  }
});

commandProcessor.initialize(process);