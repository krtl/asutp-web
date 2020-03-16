// this unit fills paramValues with the random ones.
//
// need to start server.
// need to start DBInsertor.

process.env.LOGGER_NAME = "testValues";
// process.env.LOGGER_LEVEL = "debug";

const async = require("async");
const chai = require("chai");
const mongoose = require("mongoose");
const moment = require("moment");

const { expect } = chai;

const MyDataModelParams = require("../serviceDBInsertor/myDataModelParams");

const config = require("../../config");
const amqpSender = require("../amqp/amqp_send");

let timerId;
let ticks = 0;
let maxticks = 10;
let myArgs = process.argv.slice(2);
if (myArgs.length > 0) {
  maxticks = parseInt(myArgs[0], 10);
}

console.debug(`Started with maxticks=${maxticks}.`);

let testsPassed = 0;
let testsFailed = 0;
let errs = 0;
// function setError(text) {
//   errs += 1;
//   //   logger.error(`[testSchemas] ${text}`);
//   // eslint-disable-next-line no-console
//   console.error(text);
// }
const start = moment();

const startTests = () => {
  async.series([init, sendTestValue, finit], err => {
    // console.log(arguments);

    const duration = moment().diff(start);
    console.log(
      "\x1b[33m%s\x1b[0m",
      `all tests done in ${moment(duration).format(
        "mm:ss.SSS"
      )} Passed: ${testsPassed} Failed: ${testsFailed}`
    );
    process.exit(err ? 255 : 0);
  });
};

const init = done => {
  // plug in the promise library:
  mongoose.Promise = global.Promise;

  mongoose.set("useNewUrlParser", true);
  mongoose.set("useFindAndModify", false);
  mongoose.set("useCreateIndex", true);
  mongoose.set("useUnifiedTopology", true);

  mongoose.connect(config.dbUri, {
    autoIndex: process.env.NODE_ENV !== "production"
  });

  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error"));
  db.on("connected", () => {
    console.info(`We are connected to ${config.dbUri}`);
    amqpSender.start(config.amqpUriTestSender, "TestSender");

    MyDataModelParams.LoadFromDB(err => {
      expect(err).to.equal(null);
      done();
    });
  });
};

const finit = done => {
  clearInterval(timerId);
  mongoose.connection.close(() => {
    amqpSender.stop();
    done();
  });
};

const sendTestValue = done => {
  timerId = setInterval(() => {
    const dt = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
    // const dt1 = moment()
    //   .subtract(100, "days")
    //   .format("YYYY-MM-DD HH:mm:ss.SSS");
    // const dt2 = moment()
    //   .subtract(200, "days")
    //   .format("YYYY-MM-DD HH:mm:ss.SSS");

    const value = Math.floor(Math.random() * Math.floor(300000));
    const params = MyDataModelParams.GetAllParamsAsArray();

    for (let i = 0; i < params.length; i++) {
      const paramName = params[i].name;
      // amqpSender.send(
      //   config.amqpRawValuesQueueName,
      //   `${paramName}<>${value}<>NA<>${dt2}`
      // );
      // amqpSender.send(
      //   config.amqpRawValuesQueueName,
      //   `${paramName}<>${value}<>NA<>${dt1}`
      // );
      amqpSender.send(
        config.amqpRawValuesQueueName,
        `${paramName}<>${value}<>NA<>${dt}`
      );
    }
    console.debug(
      `#${ticks} Send ${params.length} values = ${value} to raw values queue done.`
    );

    ticks++;

    if (ticks > maxticks) {
      done();
    }
  }, 5000);
};

startTests();
