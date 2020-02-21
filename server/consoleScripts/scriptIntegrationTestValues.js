// this unit does checking of param values as well as powered and switched states of nodes
// 1)testing values flow: 1)start server, 2) send raw values and set manual values 3) wait 4) recalculate
//               5)check param values and node states 6) restart server 7)check param values and node states
//
// 2) testing manual inputs for params (block unblock param values)
// 3) testing manual inputs for connections(block unblock connector state and send value to param)
// todo: 4) test historical data of param values and nodes states ()
//
// need to start DBInsertor.

process.env.RECALCULATION = "test_values";
process.env.NOWTESTING = "test_values";
process.env.LOGGER_NAME = "testValues";
// process.env.LOGGER_LEVEL = "debug";

const async = require("async");
const chai = require("chai");
const mongoose = require("mongoose");
const moment = require("moment");

const { expect } = chai;

const DbBlockedParam = require("../dbmodels/blockedParam");
const myDataModelNodes = require("../models/myDataModelNodes");
const paramValuesProcessor = require("../coreBackground/paramValuesProcessor");
const lastValues = require("../coreBackground/lastValues");
// const MyParamValue = require('../models/myParamValue');
const myNodeState = require("../models/myNodeState");
const MyNodePropNameParamRole = require("../models/MyNodePropNameParamRole");
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

const testConnectionNames = ["ps1part110sec1c1", "ps1part110sec1c2"];

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
  async.series(
    [
      init,
      testParamValues,
      testBlockingParamValues,
      testBlockingOfConnectorStateValues,
      // testHistoricalData,
      finit
    ],
    err => {
      // console.log(arguments);

      const duration = moment().diff(start);
      console.log(
        "\x1b[33m%s\x1b[0m",
        `all tests done in ${moment(duration).format(
          "mm:ss.SSS"
        )} Passed: ${testsPassed} Failed: ${testsFailed}`
      );
      process.exit(err ? 255 : 0);
    }
  );
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

    myDataModelNodes.LoadFromDB(err => {
      expect(err).to.equal(null);

      paramValuesProcessor.initializeParamValuesProcessor(
        {
          useDbValueTracker: true
        },
        () => {
          done(err);
        }
      );
    });
  });
};

const finit = done => {
  mongoose.connection.close(() => {
    amqpSender.stop();
    done();
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
    }
  }

  console.debug(
    `Check values = ${aValue} done. Correct: ${done} Failed: ${fail}.`
  );
  return fail;
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
  console.debug(
    `Check SwitchedOnAndPoweredStates for values = ${aValue} done. Failed: ${fails}.`
  );
  return fails;
};

const checkSwitchedOnAndPoweredStatesForUnkinkedPS = aValue => {
  let fails = 0;
  fails += checkSwitchedOnAndPoweredStatesForPS("ps4", aValue);
  console.debug(
    `Check SwitchedOnAndPoweredStates for UnlinkedPS for values = ${aValue} done. Failed: ${fails}.`
  );
  return fails;
};

const setManualsForConnector = (aConnector, aValue, aBlocking) => {
  return lastValues.SetManualValue({
    nodeName: aConnector.name,
    cmd: aBlocking,
    manualValue: aValue
  });
};

const setManualsForParam = (aParamName, aValue, aBlocking) => {
  return lastValues.SetManualValue({
    paramName: aParamName,
    manualValue: aValue,
    cmd: aBlocking
  });
};

const setManualsForPS = (aPSName, aValue) => {
  const ps = myDataModelNodes.GetNode(aPSName);
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
        setManualsForConnector(connector, aValue, "unblock");
        statesCount++;
      }
    }

    for (let l = 0; l < pspart.sec2secConnectors.length; l += 1) {
      const connector = pspart.sec2secConnectors[l];
      setManualsForConnector(connector, aValue, "unblock");
      statesCount++;
    }
  }
  console.debug(
    `${statesCount} connector states manually setted to values = ${aValue}.`
  );
};

const setValuesTo0 = done => {
  sendTestValue(0);
  done();
};

const setValuesTo0_forUnlinkedPS = done => {
  setManualsForPS("ps4", 0);
  done();
};

const setValuesTo1 = done => {
  sendTestValue(1);
  done();
};

const setValuesTo1_forUnlinkedPS = done => {
  setManualsForPS("ps4", 1);
  done();
};

const wait = done => {
  console.log("----- waiting -----");
  setTimeout(done, 2000);
};

const setMalualsTo1Block = done => {
  for (let i = 0; i < testParamNames.length; i++) {
    const paramName = testParamNames[i];
    const err = setManualsForParam(paramName, 1, "block");
    if (err) {
      errs++;
      done(err);
      return;
    }
  }
  done();
};

const setMalualsTo0Unblock = done => {
  for (let i = 0; i < testParamNames.length; i++) {
    const paramName = testParamNames[i];
    const err = setManualsForParam(paramName, 0, "unblock");
    if (err) {
      errs++;
      done(err);
      return;
    }
  }
  done();
};

const recalculateAndCheck1 = done => {
  MyChains.Recalculate();
  errs += checkTestValue(1);
  errs += checkSwitchedOnAndPoweredStates(1);
  done();
};

const recalculateAndCheck0 = done => {
  MyChains.Recalculate();
  errs += checkTestValue(0);
  errs += checkSwitchedOnAndPoweredStates(0);
  done();
};

const check0_forUnlinkedPS = done => {
  errs += checkSwitchedOnAndPoweredStatesForUnkinkedPS(0);
  done();
};

const check1_forUnlinkedPS = done => {
  errs += checkSwitchedOnAndPoweredStatesForUnkinkedPS(1);
  done();
};

const reload = done => {
  paramValuesProcessor.finalizeParamValuesProcessor();
  lastValues.ClearLastValues();

  myDataModelNodes.LoadFromDB(err => {
    if (err) {
      done(err);
    } else {
      paramValuesProcessor.initializeParamValuesProcessor(
        {
          useDbValueTracker: true
        },
        () => {
          myDataModelNodes.RestoreLastValuesFromDB(err => {
            done(err);
          });
        }
      );
    }
  });
};

const testParamValues = done => {
  errs = 0;

  async.series(
    [
      setMalualsTo0Unblock,
      setValuesTo0,
      setValuesTo0_forUnlinkedPS,
      wait,
      recalculateAndCheck0,
      check0_forUnlinkedPS,
      setValuesTo1,
      setValuesTo1_forUnlinkedPS,
      wait,
      recalculateAndCheck1,
      check1_forUnlinkedPS,
      reload,
      recalculateAndCheck1,
      check1_forUnlinkedPS
    ],
    err => {
      if (errs === 0) {
        // eslint-disable-next-line no-console
        console.debug("\x1b[36m%s\x1b[0m", "[testValues] passed");
        testsPassed++;
      } else {
        // res = `loading nodes failed with ${errs} errors!`;
        console.error(`[testValues] failed with ${errs} errors!`);
        testsFailed++;
      }
      done(err);
    }
  );
};

const checkIfBlockedParamsExistsInDB = callback => {
  let done = 0;

  DbBlockedParam.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) {
      console.error(`[DbBlockedParams] find failed. Error: "${err.message}".`);
      callback(err);
    } else {
      for (let i = 0; i < prms.length; i += 1) {
        const prm = prms[i];

        if (testParamNames.indexOf(prm.name) > -1) {
          done++;
        }
      }
      console.debug(
        `CheckIfBlockedParamsExistsInDB done. Correct: ${done} Failed: ${testParamNames.length -
          done}.`
      );

      errs += testParamNames.length - done;

      if (testParamNames.length - done > 0) {
        callback(Error("checkIfBlockedParamsExistsInDB failed!"));
      } else {
        callback();
      }
    }
  });
};

const checkIfBlockedParamsNotExistsInDB = callback => {
  let done = 0;

  DbBlockedParam.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) {
      console.error(`[DbBlockedParams] find failed. Error: "${err.message}".`);
      callback(err);
    } else {
      for (let i = 0; i < prms.length; i += 1) {
        const prm = prms[i];

        if (testParamNames.indexOf(prm.name) > -1) {
          done++;
        }
      }
      console.debug(
        `checkIfBlockedParamsNotExistsInDB done. Correct: ${testParamNames.length -
          done} Failed: ${done}.`
      );

      errs += done;

      if (done > 0) {
        callback(Error("checkIfBlockedParamsNotExistsInDB failed!"));
      } else {
        callback();
      }
    }
  });
};

const testBlockingParamValues = done => {
  errs = 0;

  async.series(
    [
      setMalualsTo0Unblock,
      setValuesTo0,
      setValuesTo0_forUnlinkedPS,
      wait,
      checkIfBlockedParamsNotExistsInDB,
      setMalualsTo1Block,
      recalculateAndCheck1,
      setValuesTo0,
      wait,
      checkIfBlockedParamsExistsInDB,
      recalculateAndCheck1,
      reload,
      recalculateAndCheck1
    ],
    err => {
      if (errs === 0) {
        // eslint-disable-next-line no-console
        console.debug("\x1b[36m%s\x1b[0m", "[BlockingParamValues] passed");
        testsPassed++;
      } else {
        // res = `loading nodes failed with ${errs} errors!`;
        console.error(`[BlockingParamValues] failed with ${errs} errors!`);
        testsFailed++;
      }
      done(err);
    }
  );
};

const blockConnectorsAndSet1 = done => {
  for (let i = 0; i < testConnectionNames.length; i++) {
    const connectorName = testConnectionNames[i];
    const connector = myDataModelNodes.GetNode(connectorName);
    expect(connector).to.be.an("object");

    const err = setManualsForConnector(connector, 1, "block");
    if (err) {
      errs++;
      done(err);
      return;
    }
  }

  console.debug(`${testConnectionNames.length} Connectors blocked ad setted to 1.`);

  done();
};

const unblockConnectorsAndSet0 = done => {
  for (let i = 0; i < testConnectionNames.length; i++) {
    const connectorName = testConnectionNames[i];
    const connector = myDataModelNodes.GetNode(connectorName);
    expect(connector).to.be.an("object");

    const err = setManualsForConnector(connector, 0, "unblock");
    if (err) {
      errs++;
      done(err);
      return;
    }
  }

  console.debug(`${testConnectionNames.length} Connectors unblocked and resetted to 0.`);

  done();
};

const recalculateAndCheckConnectorsState1 = cb => {
  MyChains.Recalculate();
  let done = 0;
  let fail = 0;
  for (let i = 0; i < testConnectionNames.length; i++) {
    const connectorName = testConnectionNames[i];
    const connector = myDataModelNodes.GetNode(connectorName);
    expect(connector).to.be.an("object");

    if (connector.switchedOn == 1) {
      done++;
    } else {
      fail++;
      errs++;
    }
  }

  console.debug(
    `CheckConnectorsState values = 1 done. Correct: ${done} Failed: ${fail}.`
  );

  cb();
};

const recalculateAndCheckConnectorsState0 = cb => {
  MyChains.Recalculate();
  let done = 0;
  let fail = 0;
  for (let i = 0; i < testConnectionNames.length; i++) {
    const connectorName = testConnectionNames[i];
    const connector = myDataModelNodes.GetNode(connectorName);
    expect(connector).to.be.an("object");

    if (connector.switchedOn == 0) {
      done++;
    } else {
      fail++;
      errs++;
    }
  }

  console.debug(
    `CheckConnectorsState values = 0 done. Correct: ${done} Failed: ${fail}.`
  );

  cb();
};

const checkIfBlockedParamsForConnectionsExistsInDB = callback => {
  let done = 0;

  DbBlockedParam.find({}, null, { sort: { name: 1 } }, (err, prms) => {
    if (err) {
      console.error(`[DbBlockedParams] find failed. Error: "${err.message}".`);
      callback(err);
    } else {
      for (let i = 0; i < prms.length; i += 1) {
        const prm = prms[i];

        for (let j = 0; j < testConnectionNames.length; j++) {
          const connectorName = testConnectionNames[j];
          const connector = myDataModelNodes.GetNode(connectorName);
          expect(connector).to.be.an("object");

          for (let k = 0; k < connector.equipments.length; k += 1) {
            const equipment = connector.equipments[k];
            if (MyNodePropNameParamRole.STATE in equipment) {
              if (equipment[MyNodePropNameParamRole.STATE] !== "") {
                if (prm.name == equipment[MyNodePropNameParamRole.STATE]) {
                  done++;
                }
              }
            }
          }
        }
      }
      console.debug(
        `checkIfBlockedParamsForConnectionsExistsInDB done. Correct: ${done} Failed: ${testConnectionNames.length -
          done}.`
      );

      errs += testConnectionNames.length - done;

      if (testConnectionNames.length - done > 0) {
        callback(Error("checkIfBlockedParamsForConnectionsExistsInDB failed!"));
      } else {
        callback();
      }
    }
  });
};

const testBlockingOfConnectorStateValues = done => {
  errs = 0;

  async.series(
    [
      setMalualsTo0Unblock,
      blockConnectorsAndSet1,
      setValuesTo0,
      wait,
      checkIfBlockedParamsForConnectionsExistsInDB,
      recalculateAndCheckConnectorsState1,
      unblockConnectorsAndSet0,
      setValuesTo1,
      wait,
      recalculateAndCheckConnectorsState1,
      reload,
      recalculateAndCheckConnectorsState1,
      setValuesTo0,
      wait,
      recalculateAndCheckConnectorsState0,
      blockConnectorsAndSet1,
      setValuesTo0,
      wait,
      checkIfBlockedParamsForConnectionsExistsInDB,
      reload,
      recalculateAndCheckConnectorsState1,
      setValuesTo0,
      wait,
      recalculateAndCheckConnectorsState1
    ],
    err => {
      if (errs === 0) {
        // eslint-disable-next-line no-console
        console.debug("\x1b[36m%s\x1b[0m", "[BlockingOfConnectorState] passed");
        testsPassed++;
      } else {
        // res = `loading nodes failed with ${errs} errors!`;
        console.error(`[BlockingOfConnectorState] failed with ${errs} errors!`);
        testsFailed++;
      }
      done(err);
    }
  );
};
const testHistoricalData = done => {
  done();
};
startTests();
