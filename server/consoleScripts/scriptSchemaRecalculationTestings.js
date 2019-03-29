const chai = require('chai');
const mongoose = require('mongoose');
const moment = require('moment');

const expect = chai.expect;
const myDataModelNodes = require('../models/myDataModelNodes');
const paramValuesProcessor = require('../values/paramValuesProcessor');
const lastValues = require('../values/lastValues');
const MyParamValue = require('../models/myParamValue');
const myNodeState = require('../models/myNodeState');
const MyNodePropNameParamRole = require('../models/MyNodePropNameParamRole');


const config = require('../../config');


let errs = 0;
function setError(text) {
  errs += 1;
//   logger.error(`[testSchemas] ${text}`);
  // eslint-disable-next-line no-console
  console.error(text);
}
const start = moment();


const init = ((done) => {
    // plug in the promise library:
  mongoose.Promise = global.Promise;

  mongoose.connect(config.dbUri, {
    useMongoClient: true,
    autoIndex: process.env.NODE_ENV !== 'production',
  });

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error'));
  db.on('connected', () => {
    console.info(`We are connected to ${config.dbUri}`);
    myDataModelNodes.LoadFromDB((err) => {
      expect(err).to.equal(null);

      paramValuesProcessor.initializeParamValuesProcessor(false);
      done();
    });
  });
});

function testSwitchConnectorOn(connector) {
  expect(connector).to.be.an('object');
  connector.SetManualValue({ connectorName: connector.name, cmd: 'unblock', manualValue: 1 });
  expect(connector.IsSwitchedOn()).to.equal(true);
}

function testSwitchConnectorOff(connector) {
  expect(connector).to.be.an('object');
  connector.SetManualValue({ connectorName: connector.name, cmd: 'unblock', manualValue: 0 });
  expect(connector.IsSwitchedOn()).to.equal(false);
}

function testSwitchSectionConnectorsOn(section) {
  for (let l = 0; l < section.connectors.length; l += 1) {
    const connector = section.connectors[l];
    testSwitchConnectorOn(connector);
  }
}

function testSwitchSectionConnectorsOff(section) {
  for (let l = 0; l < section.connectors.length; l += 1) {
    const connector = section.connectors[l];
    testSwitchConnectorOff(connector);
  }
}

function testConnector(connector) {
  expect(connector).to.be.an('object');

  testSwitchConnectorOn(connector);
  testSwitchConnectorOff(connector);
}

function testSection(section) {
  expect(section).to.be.an('object');
  expect(section.powered).to.equal(myNodeState.POWERED_UNKNOWN);

  if (section[MyNodePropNameParamRole.VOLTAGE] !== '') {
    const param = myDataModelNodes.GetParam(section[MyNodePropNameParamRole.VOLTAGE]);
    lastValues.setRawValue(new MyParamValue(param.name, 110, new Date(), ''));
    section.recalculatePoweredState();
    expect(section.powered).to.equal(myNodeState.POWERED_ON);

    lastValues.setRawValue(new MyParamValue(param.name, 0, new Date(), ''));
    section.recalculatePoweredState();
    expect(section.powered).to.equal(myNodeState.POWERED_OFF);
  }

  for (let l = 0; l < section.connectors.length; l += 1) {
    const connector = section.connectors[l];
    testConnector(connector);
  }


    // testing powered state of connectors

  if (section[MyNodePropNameParamRole.VOLTAGE] !== '') {
    const param = myDataModelNodes.GetParam(section[MyNodePropNameParamRole.VOLTAGE]);
    testSwitchSectionConnectorsOn(section);
    lastValues.setRawValue(new MyParamValue(param.name, 110, new Date(), ''));
    section.recalculatePoweredState();
    expect(section.powered).to.equal(myNodeState.POWERED_ON);
    for (let l = 0; l < section.connectors.length; l += 1) {
      const connector = section.connectors[l];
      try {
        expect(connector.powered).to.equal(myNodeState.POWERED_ON);
      } catch (e) {
        setError(e.message);
      }
    }

    testSwitchSectionConnectorsOff(section);
    section.recalculatePoweredState();
    expect(section.powered).to.equal(myNodeState.POWERED_ON);
    for (let l = 0; l < section.connectors.length; l += 1) {
      const connector = section.connectors[l];
      expect(connector.powered).to.equal(myNodeState.POWERED_OFF);
    }

    testSwitchSectionConnectorsOn(section);
    lastValues.setRawValue(new MyParamValue(param.name, 0, new Date(), ''));
    section.recalculatePoweredState();
    expect(section.powered).to.equal(myNodeState.POWERED_OFF);
    for (let l = 0; l < section.connectors.length; l += 1) {
      const connector = section.connectors[l];
      expect(connector.powered).to.equal(myNodeState.POWERED_OFF);
    }
  }

      // if (connector.lep2PsConnector) {
      //   const lep = connector.lep2PsConnector.parentNode;
      //   if (locNodes.indexOf(lep) < 0) {
      //     locNodes.push(lep);
      //   }
      // }
    // }
}


function testSec2SecConnector(connector) {
  testConnector(connector);

    // ..
}

function testPSPart(pspart) {
  for (let k = 0; k < pspart.sections.length; k += 1) {
    const section = pspart.sections[k];
    testSection(section);
  }

  for (let l = 0; l < pspart.sec2secConnectors.length; l += 1) {
    const connector = pspart.sec2secConnectors[l];
    testSec2SecConnector(connector);
  }
}

function testPS(ps) {
  for (let j = 0; j < ps.psparts.length; j += 1) {
    const pspart = ps.psparts[j];
    testPSPart(pspart);
  }
}


init(() => {

  const pss = myDataModelNodes.GetAllPSsAsArray();
  for (let i = 0; i < pss.length; i += 1) {
    const ps = pss[i];
    testPS(ps);
  }

  mongoose.connection.close(() => {
    // process.exit(err ? 255 : 0);

    const duration = moment().diff(start);
    if (errs === 0) {
    // logger.info(`[testSchemas] done in ${moment(duration).format('mm:ss.SSS')}`);

    // eslint-disable-next-line no-console
      console.debug(`[testSchemas] done in ${moment(duration).format('mm:ss.SSS')}`);
    } else {
    // res = `loading nodes failed with ${errs} errors!`;
    // logger.error(res);
      console.debug(`[testSchemas]  failed with ${errs} errors! in ${moment(duration).format('mm:ss.SSS')}`);
    }

    process.exit(0);
  });
});

