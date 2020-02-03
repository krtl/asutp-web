process.env.RECALCULATION = "test_values";
process.env.NOWTESTING = "test_values";
process.env.LOGGER_NAME = "testValues";
// process.env.LOGGER_LEVEL = "debug";

const chai = require("chai");
const mongoose = require("mongoose");
const moment = require("moment");

const { expect } = chai;

const myDataModelNodes = require("../models/myDataModelNodes");
const paramValuesProcessor = require("../coreBackground/paramValuesProcessor");
const lastValues = require("../coreBackground/lastValues");
// const MyParamValue = require('../models/myParamValue');
const myNodeState = require("../models/myNodeState");
// const MyNodePropNameParamRole = require('../models/MyNodePropNameParamRole');
const MyChains = require("../models/myChains");

const config = require("../../config");
const amqpSender = require("../amqp/amqp_send");

const testParamNames = [
  "param_ps1Part110sec1_Ul",
  "param_ps1Part110sec2_Ul",
  "param_ps1part35sec1_Ul",
  "param_ps1part35sec2_Ul",
  "param_ps2part35sec1_Ul",
  "param_ps2part6sec1_Ul",
  "param_ps2part6sec2_Ul",
  "param_ps3part110sec1_Ul",
  "param_ps3part35sec1_Ul",
  "param_ps3part6sec1_Ul",
  "param_ps1Part110sec1c1_VV",
  "param_ps1Part110sec1c2_VV",
  "param_ps1Part110sec1c3_VV",
  "param_ps1Part110sec2c1_VV",
  "param_ps1Part110sec2c2_VV",
  "param_ps1Part110sec2c3_VV",
  "param_ps1Part110cc1_VV",
  "param_ps1part35sec1c1_VV",
  "param_ps1part35sec1c2_VV",
  "param_ps1part35sec2c1_VV",
  "param_ps1part35sec2c2_VV",
  "param_ps1part35sec2c3_VV",
  "param_ps1part35sec2c4_VV",
  "param_ps1Part35cc1_VV",
  "param_ps2part35sec1c1_VV",
  "param_ps2part35sec1c2_VV",
  "param_ps2part35sec1c3_VV",
  "param_ps2part6sec1c1_VV",
  "param_ps2part6sec1c2_VV",
  "param_ps2part6sec1c3_VV",
  "param_ps2part6sec2c1_VV",
  "param_ps2part6sec2c2_VV",
  "param_ps2part6sec2c3_VV",
  "param_ps3part110sec1c1_VV",
  "param_ps3part110sec1c2_VV",
  "param_ps3part35sec1c1_VV",
  "param_ps3part35sec1c2_VV",
  "param_ps3part35sec1c3_VV",
  "param_ps3part35sec1c4_VV",
  "param_ps3part6sec1c1_VV",
  "param_ps3part6sec1c2_VV",
  "param_ps3part6sec1c3_VV",
  "param_ps3part6sec1c4_VV",
  "param_ps1Part110sec1c1_P",
  "param_ps1Part110sec1c2_P",
  "param_ps1Part110sec1c3_P",
  "param_ps1Part110sec2c1_P",
  "param_ps1Part110sec2c2_P",
  "param_ps1Part110sec2c3_P",
  "param_ps1part35sec1c1_P",
  "param_ps1part35sec1c2_P",
  "param_ps1part35sec2c1_P",
  "param_ps1part35sec2c2_P",
  "param_ps1part35sec2c3_P",
  "param_ps1part35sec2c4_P",
  "param_ps2part35sec1c1_P",
  "param_ps2part35sec1c2_P",
  "param_ps2part35sec1c3_P",
  "param_ps2part6sec1c1_P",
  "param_ps2part6sec1c2_P",
  "param_ps2part6sec1c3_P",
  "param_ps2part6sec2c1_P",
  "param_ps2part6sec2c2_P",
  "param_ps2part6sec2c3_P",
  "param_ps3part110sec1c1_P",
  "param_ps3part110sec1c2_P",
  "param_ps3part35sec1c1_P",
  "param_ps3part35sec1c2_P",
  "param_ps3part35sec1c3_P",
  "param_ps3part35sec1c4_P",
  "param_ps3part6sec1c1_P",
  "param_ps3part6sec1c2_P",
  "param_ps3part6sec1c3_P",
  "param_ps3part6sec1c4_P"
];

const testConnectionNames = ["ps4part110cc1", "ps4part110cc2"];

let errs = 0;
// function setError(text) {
//   errs += 1;
//   //   logger.error(`[testSchemas] ${text}`);
//   // eslint-disable-next-line no-console
//   console.error(text);
// }
const start = moment();

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
    amqpSender.start(config.amqpUri, "TestSender");

    myDataModelNodes.LoadFromDB(err => {
      expect(err).to.equal(null);

      paramValuesProcessor.initializeParamValuesProcessor(
        {
          useDbValueTracker: true
        },
        () => {
          done();
        }
      );
    });
  });
};

const finit = () => {
  mongoose.connection.close(() => {
    amqpSender.stop();

    const duration = moment().diff(start);
    if (errs === 0) {
      // logger.info(`[testSchemas] done in ${moment(duration).format('mm:ss.SSS')}`);

      // eslint-disable-next-line no-console
      console.debug(
        `[testValues] done in ${moment(duration).format("mm:ss.SSS")}`
      );
    } else {
      // res = `loading nodes failed with ${errs} errors!`;
      // logger.error(res);
      console.debug(
        `[testValues] failed with ${errs} errors! in ${moment(duration).format(
          "mm:ss.SSS"
        )}`
      );
    }

    process.exit(0);
  });
};

const sendTestValue = aValue => {
  const dt = moment().format("YYYY-MM-DD HH:mm:ss.SSS");
  for (let i = 0; i < testParamNames.length; i++) {
    const paramName = testParamNames[i];
    const s = `${paramName}<>${aValue}<>NA<>${dt}`;
    amqpSender.send(config.amqpRawValuesQueueName, s);
  }
  console.debug(
    `Send ${testParamNames.length} values = ${aValue} to raw values queue done.`
  );
};

const checkTestValue = aValue => {
  let done = 0;
  let fail = 0;
  for (let i = 0; i < testParamNames.length; i++) {
    const paramName = testParamNames[i];
    const lastValue = lastValues.getLastValue(paramName);
    if (lastValue.value == aValue) {
      done++;
    } else {
      fail++;
      errs++;
    }
  }

  console.debug(
    `Check values = ${aValue} done. Correct: ${done} Failed: ${fail}.`
  );
};

const checkSwitchedOnAndPoweredStatesForPS = (psName, aValue) => {
  let fails = 0;
  const ps = myDataModelNodes.GetNode(psName);
  expect(ps).to.be.an("object");

  let poweredValue = aValue;
  if (psName == "ps4" && aValue == 0) {
    poweredValue = -1;
  }

  for (let j = 0; j < ps.psparts.length; j += 1) {
    const pspart = ps.psparts[j];
    for (let k = 0; k < pspart.sections.length; k += 1) {
      const section = pspart.sections[k];
      //if (section[MyNodePropNameParamRole.VOLTAGE] !== "") {
      if (section.powered != poweredValue) {
        fails++;
      }

      for (let l = 0; l < section.connectors.length; l += 1) {
        const connector = section.connectors[l];

        if (connector.powered != poweredValue) {
          fails++;
        }

        if (connector.switchedOn != aValue) {
          fails++;
        }
      }
    }

    for (let l = 0; l < pspart.sec2secConnectors.length; l += 1) {
      const connector = pspart.sec2secConnectors[l];
      if (connector.powered != poweredValue) {
        fails++;
      }

      if (connector.switchedOn != aValue) {
        fails++;
      }
    }
  }
  return fails;
};

const checkSwitchedOnAndPoweredStates = aValue => {
  let fails = 0;
  fails += checkSwitchedOnAndPoweredStatesForPS("ps1", aValue);
  fails += checkSwitchedOnAndPoweredStatesForPS("ps2", aValue);
  fails += checkSwitchedOnAndPoweredStatesForPS("ps3", aValue);
  fails += checkSwitchedOnAndPoweredStatesForPS("ps4", aValue);
  console.debug(
    `Check SwitchedOnAndPoweredStates for values = ${aValue} done. Failed: ${fails}.`
  );
};

const setManuals = aValue => {
  const ps = myDataModelNodes.GetNode("ps4");
  expect(ps).to.be.an("object");

  let statesCount = 0;

  for (let j = 0; j < ps.psparts.length; j += 1) {
    const pspart = ps.psparts[j];
    for (let k = 0; k < pspart.sections.length; k += 1) {
      const section = pspart.sections[k];
      //   if (section[MyNodePropNameParamRole.VOLTAGE] !== "") {
      //   }

      for (let l = 0; l < section.connectors.length; l += 1) {
        const connector = section.connectors[l];

        connector.SetManualValue({
          nodeName: connector.name,
          cmd: "unblock",
          manualValue: aValue
        });
        statesCount++;
      }
    }

    for (let l = 0; l < pspart.sec2secConnectors.length; l += 1) {
      const connector = pspart.sec2secConnectors[l];
      connector.SetManualValue({
        nodeName: connector.name,
        cmd: "unblock",
        manualValue: aValue
      });
      statesCount++;
    }
  }
  console.debug(
    `${statesCount} connector states manually setted to values = ${aValue}.`
  );
};

init(() => {
  sendTestValue(0);
  setManuals(0);

  setTimeout(() => {
    MyChains.Recalculate();

    checkTestValue(0);
    checkSwitchedOnAndPoweredStates(0);

    sendTestValue(1);
    setManuals(1);

    setTimeout(() => {
      MyChains.Recalculate();

      checkTestValue(1);
      checkSwitchedOnAndPoweredStates(1);

      if (errs == 0) {
        myDataModelNodes.LoadFromDB(err => {
          expect(err).to.equal(null);

          paramValuesProcessor.initializeParamValuesProcessor(
            {
              useDbValueTracker: true
            },
            () => {
              myDataModelNodes.RestoreLastValuesFromDB(err => {
                expect(err).to.equal(null);

                checkTestValue(1);
                checkSwitchedOnAndPoweredStates(1);
                finit();
              });
            }
          );
        });
      } else {
        finit();
      }
    }, 2000);
  }, 2000);
});
