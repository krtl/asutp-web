process.env.LOGGER_SHMEMA = "external_service"; //else used local logger
process.env.LOGGER_NAME = "serviceDbInsertor";
process.env.LOGGER_LEVEL = "verbose";

const logger = require("../logger");
const amqpLogSender = require("../amqp/amqp_send");

logger.setup({ amqpSender: amqpLogSender });

const moment = require("moment");
const mongoose = require("mongoose");
const config = require("../../config");
const MyDataModelParams = require("./myDataModelParams");
const MyParamValue = require("../models/myParamValue");
const MyNodePoweredStateValue = require("../models/myNodePoweredStateValue");
const MyNodeSwitchedOnStateValue = require("../models/myNodeSwitchedOnStateValue");
const amqpValuesReceiver = require("../amqp/amqp_receive");
const amqpNodeStateReceiver = require("../amqp/amqp_receive1");
const DbValuesTracker = require("./dbValuesTracker");
const DbParamValues = require("./dbParamValues");
const DbNodeStateValues = require("./dbNodeStateValues");
const HalfHourValuesTracker = require("./halfHourValuesTracker");

mongoose.Promise = global.Promise;

mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);

mongoose.connect(config.dbUri, {
  // useMongoClient: true,
  autoIndex: process.env.NODE_ENV !== "production"
});

const db = mongoose.connection;
db.on("error", logger.error.bind(logger, "connection error"));
db.on("connected", () => {
  logger.info(`We are connected to ${config.dbUri}`);
  MyDataModelParams.LoadFromDB(err => {
    if (err) {
      logger.error(`Failed! Error: ${err.message}`);
    } else {
      HalfHourValuesTracker.loadLastTrackedValues(err => {
        if (err) {
          logger.error(`Failed! Error: ${err.message}`);
        } else {
          amqpValuesReceiver.start(
            config.amqpUriDbInsertor,
            config.amqpInsertValuesQueueName,
            received => {
              logger.verbose(`[ValuesReceiver] Got msg ${received}`);

              // paramName<>55,63<>NA<>2017-11-17 10:05:44.132
              const s = received.split("<>");

              if (s.length > 1) {
                const type = s[0];
                if (type == "BP") {
                  let user;
                  if (s.length > 2) user = s[2];
                  DbParamValues.BlockDbParamValue(s[1], user);
                } else if (type == "UBP") {
                  DbParamValues.UnblockDbParamValue(s[1]);
                } else if (type == "PV") {
                  if (s.length === 5) {
                    const momentDT = moment(s[4]);
                    const dt = new Date(momentDT);
                    const float = parseFloat(s[2].replace(",", "."));
                    const obj = new MyParamValue(s[1], float, dt, s[3]);

                    if (isNaN(float)) {
                      logger.error(
                        `[ValuesReceiver][MyParamValue] Failed to parse floating-point value in: ${received}`
                      );
                    } else {
                      DbValuesTracker.trackDbParamValue(obj);
                    }
                  } else {
                    logger.error(
                      `[ValuesReceiver][MyParamValue] Failed to parse: ${received}`
                    );
                  }
                } else {
                  logger.error(
                    `[ValuesReceiver][MyParamValue] Unknown command: ${received}`
                  );
                }
              } else {
                logger.error(
                  `[ValuesReceiver][MyParamValue] Failed to parse: ${received}`
                );
              }
            }
          );

          // should be remade!

          amqpNodeStateReceiver.start(
            config.amqpUriDbInsertor,
            config.amqpInsertNodeStateQueueName,
            received => {
              logger.verbose(`[NodeStateReceiver] Got msg ${received}`);

              // nodeName<>oldState<>newState<>2017-11-17 10:05:44.132<>user
              const s = received.split("<>");
              if (s.length === 6) {
                const type = s[0];
                const momentDT = moment(s[4]);
                const dt = new Date(momentDT);

                if (type == "P") {
                  const oldState = parseInt(s[2], 10);
                  const newState = parseInt(s[3], 10);
                  const obj = new MyNodePoweredStateValue(
                    s[1],
                    oldState,
                    newState,
                    dt
                  );
                  DbNodeStateValues.SavePoweredNodeStateValue(obj);
                } else if (type == "S") {
                  const oldState = s[2];
                  const newState = s[3];
                  const user = s[5];
                  const obj = new MyNodeSwitchedOnStateValue(
                    s[1],
                    oldState,
                    newState,
                    dt,
                    user
                  );
                  DbNodeStateValues.SaveSwitchedOnNodeStateValue(obj);
                } else {
                  logger.error(
                    `[NodeStateReceiver][MyNodePoweredStateValue] Unknown obj to track: ${received}`
                  );
                }
              } else {
                logger.error(
                  `[NodeStateReceiver][MyNodePoweredStateValue] Failed to parse: ${received}`
                );
              }
            }
          );
        }
      });
    }
  });
});

// mongoose.connection.close((err) => {
//     if (err) {
//       logger.info(`We are disconnected from db. Error: ${err.message}`);
//     } else {
//       logger.info('We are disconnected from db.');
//     }
//   });
// });

process.on("SIGINT", () => {
  logger.info("[] Stopping ...");

  mongoose.connection.close(err => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error(`Error on close Mongoose connection: ${err.message}`);
      process.exit(1);
    }
    // eslint-disable-next-line no-console
    console.log("Mongoose connection disconnected");

    amqpValuesReceiver.stop();
    amqpNodeStateReceiver.stop();
    amqpLogSender.stop();
  });
});
