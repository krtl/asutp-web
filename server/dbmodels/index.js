const mongoose = require("mongoose");
const logger = require("../logger");
const myDataModelNodes = require("../models/myDataModelNodes");
const myDataModelSchemas = require("../models/myDataModelSchemas");
const commandsServer = require("../serviceServer/commandsServer");

let paramValuesProcessor = undefined;
if (process.env.RECALCULATION) {
  paramValuesProcessor = require("../serviceBackground/paramValuesProcessor");
}

module.exports.connect = (uri, useDataModel, callback) => {
  // mongoose.connect(uri);
  mongoose.set("useNewUrlParser", true);
  mongoose.set("useFindAndModify", false);
  mongoose.set("useCreateIndex", true);
  mongoose.set("useUnifiedTopology", true);

  mongoose.connect(uri, {
    // useMongoClient: true,
    autoIndex: process.env.NODE_ENV !== "production",
  });

  // plug in the promise library:
  mongoose.Promise = global.Promise;

  mongoose.connection.on("connected", () => {
    logger.info(`Mongoose connected to ${uri}`);

    if (useDataModel) {
      myDataModelNodes.LoadFromDB((err) => {
        if (err) {
          if (callback) callback(err);
          return;
        }
        if (process.env.RECALCULATION) {
          paramValuesProcessor.initializeParamValuesProcessor(
            {
              useStompServer: true,
              useDbValueTracker: true,
            },
            () => {
              myDataModelNodes.RestoreLastValuesFromDB((err) => {
                if (callback) callback(err);
              });
            }
          );
        } else {
          myDataModelSchemas.LoadFromDB((err) => {

            commandsServer.SetParamsInitialized();

            commandsServer.GetAllParamValues();

            //..
            if (callback) callback(err);
          });
        }
      });
    }
  });

  mongoose.connection.on("error", (err) => {
    logger.error(`Mongoose connection error: ${err.message}`);
    // eslint-disable-next-line no-console
    console.error(`Mongoose connection error: ${err.message}`);
    process.exit(1);
  });

  mongoose.connection.on("disconnected", () => {
    logger.info("Mongoose default connection disconnected");
  });

  // load models
  require("./authUser"); // eslint-disable-line global-require
  require("./authUserAction"); // eslint-disable-line global-require
  require("./param"); // eslint-disable-line global-require
  require("./paramValue"); // eslint-disable-line global-require
  require("./paramHalfHourValue"); // eslint-disable-line global-require
  require("./blockedParam"); // eslint-disable-line global-require

  require("./asutpConnection"); // eslint-disable-line global-require

  // require("./netNode"); // eslint-disable-line global-require
  // require("./netWire"); // eslint-disable-line global-require
  require("./nodeCoordinates"); // eslint-disable-line global-require
  require("./nodeSchema"); // eslint-disable-line global-require

  require("./node"); // eslint-disable-line global-require
  require("./nodeRegion"); // eslint-disable-line global-require
  require("./nodeLEP"); // eslint-disable-line global-require
  require("./nodeLEP2LEPConnection"); // eslint-disable-line global-require
  require("./nodeLEP2PSConnection"); // eslint-disable-line global-require
  require("./nodePS"); // eslint-disable-line global-require
  require("./nodePSPart"); // eslint-disable-line global-require
  require("./nodeTransformer"); // eslint-disable-line global-require
  require("./nodeTransformerConnector"); // eslint-disable-line global-require
  require("./nodeSection"); // eslint-disable-line global-require
  require("./nodeSectionConnector"); // eslint-disable-line global-require
  require("./nodeSec2SecConnector"); // eslint-disable-line global-require
  require("./nodeEquipment"); // eslint-disable-line global-require

  require("./nodeParamLinkage"); // eslint-disable-line global-require

  require("./nodePoweredStateValue"); // eslint-disable-line global-require
  require("./nodeSwitchedOnStateValue"); // eslint-disable-line global-require
};
