const chai = require('chai');
const mongoose = require('mongoose');
const moment = require('moment');

const { expect } = chai;
const myDataModelNodes = require('../models/myDataModelNodes');
const paramValuesProcessor = require('../values/paramValuesProcessor');
const lastValues = require('../values/lastValues');
// const MyParamValue = require('../models/myParamValue');
const myNodeState = require('../models/myNodeState');
// const MyNodePropNameParamRole = require('../models/MyNodePropNameParamRole');
const MyChains = require('../models/myChains');


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

  mongoose.set('useNewUrlParser', true);
  mongoose.set('useFindAndModify', false);
  mongoose.set('useCreateIndex', true);
  mongoose.set('useUnifiedTopology', true);

  mongoose.connect(config.dbUri, {
    autoIndex: process.env.NODE_ENV !== 'production',
  });

  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error'));
  db.on('connected', () => {
    console.info(`We are connected to ${config.dbUri}`);
    myDataModelNodes.LoadFromDB((err) => {
      expect(err).to.equal(null);

      paramValuesProcessor.initializeParamValuesProcessor({ useStompServer: false, useDbValueTracker: false });
      done();
    });
  });
});

function switchConnectorOn(connector) {
  expect(connector).to.be.an('object');
  connector.SetManualValue({ nodeName: connector.name, cmd: 'unblock', manualValue: 1 });
  expect(connector.getSwitchedOn()).to.equal(true);
}

function switchConnectorOff(connector) {
  expect(connector).to.be.an('object');
  connector.SetManualValue({ nodeName: connector.name, cmd: 'unblock', manualValue: 0 });
  expect(connector.getSwitchedOn()).to.equal(false);
}

function switchSectionConnectorsOn(section) {
  for (let l = 0; l < section.connectors.length; l += 1) {
    const connector = section.connectors[l];
    if (!connector.transformerConnector) {
      switchConnectorOn(connector);
    }
  }
}

function switchSectionConnectorsOff(section) {
  for (let l = 0; l < section.connectors.length; l += 1) {
    const connector = section.connectors[l];
    if (!connector.transformerConnector) {
      switchConnectorOff(connector);
    }
  }
}

function switchSectionTransofrmerConnectorsOn(section) {
  for (let l = 0; l < section.connectors.length; l += 1) {
    const connector = section.connectors[l];
    if (connector.transformerConnector) {
      switchConnectorOn(connector);
    }
  }
}

function switchSectionTransofrmerConnectorsOff(section) {
  for (let l = 0; l < section.connectors.length; l += 1) {
    const connector = section.connectors[l];
    if (connector.transformerConnector) {
      switchConnectorOff(connector);
    }
  }
}

function testConnector(connector) {
  expect(connector).to.be.an('object');

  switchConnectorOn(connector);
  switchConnectorOff(connector);
}

function PowerSection(section) {
  expect(section).to.be.an('object');
  section.SetManualValue({ nodeName: section.name, cmd: 'unblock', manualValue: 110 });
  section.updatePoweredState();
  expect(section.powered, section.name).to.equal(myNodeState.POWERED_ON);
}

function UnpowerSection(section) {
  expect(section).to.be.an('object');
  section.SetManualValue({ nodeName: section.name, cmd: 'unblock', manualValue: 0 });
  section.updatePoweredState();
  expect(section.powered).to.equal(myNodeState.POWERED_OFF);
}

function testSection(section) {
  expect(section).to.be.an('object');
  PowerSection(section);
  UnpowerSection(section);
}

function CheckIfPsIsPowered(ps, poweredState) {
  let thereIsAtrustedSection = false;
  for (let j = 0; j < ps.psparts.length; j += 1) {
    const pspart = ps.psparts[j];
    for (let k = 0; k < pspart.sections.length; k += 1) {
      const section = pspart.sections[k];
      if (section.powered === myNodeState.POWERED_UNKNOWN) {
        for (let l = 0; l < section.connectors.length; l += 1) {
          const connector = section.connectors[l];
          expect(connector.powered).to.equal(myNodeState.POWERED_UNKNOWN);
        }
      } else {
        for (let l = 0; l < section.connectors.length; l += 1) {
          const connector = section.connectors[l];
          expect(connector.powered).to.equal(poweredState);
          thereIsAtrustedSection = true;
        }
      }
    }
  }

  if (thereIsAtrustedSection) {
    expect(ps.powered, ps.name).to.equal(poweredState);
  } else {
    expect(ps.powered, ps.name).to.equal(myNodeState.POWERED_UNKNOWN);
  }
}

function testSec2SecConnector(sec2secConnector) {
  testConnector(sec2secConnector);

  //
}

function testTransformer(transformer) {
  // const ps = transformer.parentNode;

  //
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
  for (let i = 0; i < ps.psparts.length; i += 1) {
    const pspart = ps.psparts[i];
    testPSPart(pspart);
  }

  for (let i = 0; i < ps.transformers.length; i += 1) {
    const tramsformer = ps.transformers[i];
    testTransformer(tramsformer);
  }
}

function testLEP(lep) {
  //
}


function resetSchema() {
  const pss = myDataModelNodes.GetAllPSsAsArray();
  for (let i = 0; i < pss.length; i += 1) {
    const ps = pss[i];
    for (let j = 0; j < ps.psparts.length; j += 1) {
      const pspart = ps.psparts[j];
      for (let k = 0; k < pspart.sections.length; k += 1) {
        const section = pspart.sections[k];
        section.SetManualValue({ nodeName: section.name, cmd: 'unblock', manualValue: 0 });
        for (let l = 0; l < section.connectors.length; l += 1) {
          const connector = section.connectors[l];
          switchConnectorOff(connector);
        }
      }

      for (let l = 0; l < pspart.sec2secConnectors.length; l += 1) {
        const connector = pspart.sec2secConnectors[l];
        switchConnectorOff(connector);
      }
    }
  }

  MyChains.Recalculate();

  for (let i = 0; i < pss.length; i += 1) {
    const ps = pss[i];
    CheckIfPsIsPowered(ps, myNodeState.POWERED_OFF);
  }

  const leps = myDataModelNodes.GetAllLEPsAsArray();
  for (let i = 0; i < leps.length; i += 1) {
    const lep = leps[i];
    expect(lep.powered, lep.name).to.equal(myNodeState.POWERED_UNKNOWN);
  }
}

function schemaTestPoweringThroughLep() {
  resetSchema();

  const connector = myDataModelNodes.GetNode('ps1part110sec1c2');
  const section = myDataModelNodes.GetNode('ps1part110sec1');

  switchConnectorOn(connector);
  PowerSection(section);

  MyChains.Recalculate();

  const lep1 = myDataModelNodes.GetNode('lep110_1');
  expect(lep1.powered, lep1.name).to.equal(myNodeState.POWERED_ON);
  const lep2 = myDataModelNodes.GetNode('lep110_2');
  expect(lep2.powered, lep2.name).to.equal(myNodeState.POWERED_ON);

  const sec1 = myDataModelNodes.GetNode('ps4part110sec1');
  switchSectionConnectorsOn(sec1);

  MyChains.Recalculate();

  expect(sec1.powered, sec1.name).to.equal(myNodeState.POWERED_ON);

  const sec2 = myDataModelNodes.GetNode('ps1part110sec2');
  const s2sConnector1 = myDataModelNodes.GetNode('ps1part110cc1');
  switchConnectorOn(s2sConnector1);

  MyChains.Recalculate();
  expect(sec2.powered, sec2.name).to.equal(myNodeState.POWERED_OFF);
}

function schemaTestPoweringThroughTransformer() {
  resetSchema();

  const connector = myDataModelNodes.GetNode('ps1part110sec1c2');
  const section = myDataModelNodes.GetNode('ps1part110sec1');

  switchConnectorOn(connector);
  UnpowerSection(section);

  const sec1 = myDataModelNodes.GetNode('ps4part110sec1');
  const sec2 = myDataModelNodes.GetNode('ps4part35sec1');
  const sec3 = myDataModelNodes.GetNode('ps4part10sec1');

  const lep1 = myDataModelNodes.GetNode('lep110_1');
  const lep2 = myDataModelNodes.GetNode('lep110_2');
  const lep3 = myDataModelNodes.GetNode('lep35_1');
  const lep4 = myDataModelNodes.GetNode('lep10_1');

  switchSectionConnectorsOn(sec1);
  switchSectionTransofrmerConnectorsOn(sec1);
  switchSectionConnectorsOn(sec2);
  switchSectionTransofrmerConnectorsOn(sec2);
  switchSectionConnectorsOn(sec3);
  switchSectionTransofrmerConnectorsOn(sec3);

  MyChains.Recalculate();

  expect(lep1.powered).to.equal(myNodeState.POWERED_OFF);
  expect(lep2.powered).to.equal(myNodeState.POWERED_OFF);
  expect(lep3.powered).to.equal(myNodeState.POWERED_OFF);
  expect(lep4.powered).to.equal(myNodeState.POWERED_OFF);

  expect(sec1.powered).to.equal(myNodeState.POWERED_OFF);
  expect(sec2.powered).to.equal(myNodeState.POWERED_OFF);
  expect(sec3.powered).to.equal(myNodeState.POWERED_OFF);


  PowerSection(section);

  MyChains.Recalculate();

  expect(lep1.powered).to.equal(myNodeState.POWERED_ON);
  expect(lep2.powered).to.equal(myNodeState.POWERED_ON);
  expect(lep3.powered).to.equal(myNodeState.POWERED_ON);
  expect(lep4.powered).to.equal(myNodeState.POWERED_ON);

  expect(sec1.powered).to.equal(myNodeState.POWERED_ON);
  expect(sec2.powered).to.equal(myNodeState.POWERED_ON);
  expect(sec3.powered).to.equal(myNodeState.POWERED_ON);

  UnpowerSection(section);

  switchSectionTransofrmerConnectorsOff(sec3);
  switchSectionConnectorsOff(sec3);

  MyChains.Recalculate();

  expect(lep1.powered).to.equal(myNodeState.POWERED_OFF);
  expect(lep2.powered).to.equal(myNodeState.POWERED_OFF);
  expect(lep3.powered).to.equal(myNodeState.POWERED_OFF);
  expect(lep4.powered).to.equal(myNodeState.POWERED_UNKNOWN);

  expect(sec1.powered).to.equal(myNodeState.POWERED_OFF);
  expect(sec2.powered).to.equal(myNodeState.POWERED_OFF);
  expect(sec3.powered).to.equal(myNodeState.POWERED_UNKNOWN);
}

function schemaTestPoweringThroughSec2SecConnector() {
  resetSchema();

  const connector = myDataModelNodes.GetNode('ps1part110sec1c2');
  const section = myDataModelNodes.GetNode('ps1part110sec1');

  switchConnectorOn(connector);
  UnpowerSection(section);

  const sec1 = myDataModelNodes.GetNode('ps4part110sec1');
  const sec2 = myDataModelNodes.GetNode('ps4part110sec2');
  const sec3 = myDataModelNodes.GetNode('ps4part10sec2');
  const sec4 = myDataModelNodes.GetNode('ps4part10sec1');

  const lep1 = myDataModelNodes.GetNode('lep110_1');
  const lep2 = myDataModelNodes.GetNode('lep110_2');
  const lep3 = myDataModelNodes.GetNode('lep35_1');
  const lep4 = myDataModelNodes.GetNode('lep10_1');
  const lep5 = myDataModelNodes.GetNode('lep10_5');

  switchSectionConnectorsOn(sec1);
  switchSectionTransofrmerConnectorsOff(sec1);

  switchSectionConnectorsOff(sec2);
  switchSectionTransofrmerConnectorsOn(sec2);

  switchSectionConnectorsOn(sec3);
  switchSectionTransofrmerConnectorsOn(sec3);

  switchSectionConnectorsOn(sec4);
  switchSectionTransofrmerConnectorsOff(sec4);

  const s2sConnector1 = myDataModelNodes.GetNode('ps4part110cc1');
  const s2sConnector2 = myDataModelNodes.GetNode('ps4part10cc2');
  switchConnectorOn(s2sConnector1);
  switchConnectorOn(s2sConnector2);

  MyChains.Recalculate();


  expect(sec1.powered).to.equal(myNodeState.POWERED_OFF);
  expect(sec2.powered).to.equal(myNodeState.POWERED_OFF);
  expect(sec3.powered).to.equal(myNodeState.POWERED_OFF);
  expect(sec4.powered).to.equal(myNodeState.POWERED_OFF);

  expect(lep1.powered).to.equal(myNodeState.POWERED_OFF);
  expect(lep2.powered).to.equal(myNodeState.POWERED_OFF);
  expect(lep3.powered).to.equal(myNodeState.POWERED_UNKNOWN);
  expect(lep4.powered).to.equal(myNodeState.POWERED_OFF);
  expect(lep5.powered).to.equal(myNodeState.POWERED_OFF);

  PowerSection(section);

  MyChains.Recalculate();

  expect(sec1.powered).to.equal(myNodeState.POWERED_ON);
  expect(sec2.powered).to.equal(myNodeState.POWERED_ON);
  expect(sec3.powered).to.equal(myNodeState.POWERED_ON);
  expect(sec4.powered).to.equal(myNodeState.POWERED_ON);

  expect(lep1.powered).to.equal(myNodeState.POWERED_ON);
  expect(lep2.powered).to.equal(myNodeState.POWERED_ON);
  expect(lep3.powered).to.equal(myNodeState.POWERED_UNKNOWN);
  expect(lep4.powered).to.equal(myNodeState.POWERED_ON);
  expect(lep5.powered).to.equal(myNodeState.POWERED_ON);

  // UnpowerSection(section);

  // switchSectionTransofrmerConnectorsOff(sec3);
  switchSectionConnectorsOff(sec1);

  MyChains.Recalculate();

  expect(sec1.powered).to.equal(myNodeState.POWERED_UNKNOWN);
  expect(sec2.powered).to.equal(myNodeState.POWERED_UNKNOWN);
  expect(sec3.powered).to.equal(myNodeState.POWERED_UNKNOWN);
  expect(sec4.powered).to.equal(myNodeState.POWERED_UNKNOWN);

  expect(lep1.powered).to.equal(myNodeState.POWERED_ON);
  expect(lep2.powered).to.equal(myNodeState.POWERED_ON);
  expect(lep3.powered).to.equal(myNodeState.POWERED_UNKNOWN);
  expect(lep4.powered).to.equal(myNodeState.POWERED_UNKNOWN);
  expect(lep5.powered).to.equal(myNodeState.POWERED_UNKNOWN);
}

function schemaTestPoweringCollisions() {
  resetSchema();

  // const connector = myDataModelNodes.GetNode('ps1part110sec1c2');

  const sec1 = myDataModelNodes.GetNode('ps1part110sec1');
  const sec2 = myDataModelNodes.GetNode('ps1part110sec2');
  const sec3 = myDataModelNodes.GetNode('ps1part35sec1');
  const sec4 = myDataModelNodes.GetNode('ps1part35sec2');

  const sec5 = myDataModelNodes.GetNode('ps3part110sec1');
  const sec6 = myDataModelNodes.GetNode('ps3part6sec1');
  const sec7 = myDataModelNodes.GetNode('ps3part35sec1');

  const sec8 = myDataModelNodes.GetNode('ps4part35sec1');
  const sec9 = myDataModelNodes.GetNode('ps4part10sec1');

  const lep1 = myDataModelNodes.GetNode('lep110_1');


  expect(sec1.powered, sec1.name).to.equal(myNodeState.POWERED_OFF);
  expect(sec2.powered, sec2.name).to.equal(myNodeState.POWERED_OFF);
  expect(sec3.powered, sec3.name).to.equal(myNodeState.POWERED_OFF);
  expect(sec4.powered, sec4.name).to.equal(myNodeState.POWERED_OFF);

  // simulation of the first init
  lastValues.ClearLastValues();
  sec1.powered = myNodeState.POWERED_UNKNOWN;
  sec2.powered = myNodeState.POWERED_UNKNOWN;
  sec3.powered = myNodeState.POWERED_UNKNOWN;
  sec4.powered = myNodeState.POWERED_UNKNOWN;
  sec5.powered = myNodeState.POWERED_UNKNOWN;
  sec6.powered = myNodeState.POWERED_UNKNOWN;
  sec7.powered = myNodeState.POWERED_UNKNOWN;
  sec8.powered = myNodeState.POWERED_UNKNOWN;
  sec9.powered = myNodeState.POWERED_UNKNOWN;


  const s2sConnector1 = myDataModelNodes.GetNode('ps1part110cc1');
  const s2sConnector2 = myDataModelNodes.GetNode('ps1part35cc1');

  switchSectionTransofrmerConnectorsOn(sec1);
  switchSectionTransofrmerConnectorsOn(sec2);
  switchSectionTransofrmerConnectorsOn(sec3);
  switchSectionTransofrmerConnectorsOn(sec4);
  switchConnectorOn(s2sConnector1);
  switchConnectorOn(s2sConnector2);

  PowerSection(sec1);
  MyChains.Recalculate();

  expect(sec1.powered, sec1.name).to.equal(myNodeState.POWERED_ON);
  expect(sec2.powered, sec2.name).to.equal(myNodeState.POWERED_ON);
  expect(sec3.powered, sec3.name).to.equal(myNodeState.POWERED_ON);
  expect(sec4.powered, sec4.name).to.equal(myNodeState.POWERED_ON);

  UnpowerSection(sec2);
  MyChains.Recalculate();

  expect(sec1.powered, sec1.name).to.equal(myNodeState.POWERED_ON);
  expect(sec2.powered, sec2.name).to.equal(myNodeState.POWERED_OFF);
  expect(sec3.powered, sec3.name).to.equal(myNodeState.POWERED_ON);
  expect(sec4.powered, sec4.name).to.equal(myNodeState.POWERED_ON);

  UnpowerSection(sec4);
  MyChains.Recalculate();

  expect(sec1.powered, sec1.name).to.equal(myNodeState.POWERED_ON);
  expect(sec2.powered, sec2.name).to.equal(myNodeState.POWERED_OFF);
  expect(sec3.powered, sec3.name).to.equal(myNodeState.POWERED_OFF);
  expect(sec4.powered, sec4.name).to.equal(myNodeState.POWERED_OFF);


  switchSectionConnectorsOn(sec1);
  switchSectionConnectorsOn(sec5);
  switchSectionTransofrmerConnectorsOn(sec5);
  // switchSectionConnectorsOn(sec6);
  switchSectionTransofrmerConnectorsOn(sec6);

  MyChains.Recalculate();

  expect(lep1.powered, lep1.name).to.equal(myNodeState.POWERED_ON);
  expect(sec5.powered, sec5.name).to.equal(myNodeState.POWERED_ON);
  expect(sec6.powered, sec6.name).to.equal(myNodeState.POWERED_ON);

  UnpowerSection(sec6);
  MyChains.Recalculate();

  expect(lep1.powered, lep1.name).to.equal(myNodeState.POWERED_ON);
  expect(sec5.powered, sec5.name).to.equal(myNodeState.POWERED_OFF);
  expect(sec6.powered, sec6.name).to.equal(myNodeState.POWERED_OFF);

  // ---------------

  switchSectionTransofrmerConnectorsOn(sec5);

  switchSectionConnectorsOn(sec7);
  switchSectionTransofrmerConnectorsOn(sec7);

  MyChains.Recalculate();

  switchSectionConnectorsOn(sec8);
  switchSectionTransofrmerConnectorsOn(sec8);
  switchSectionConnectorsOn(sec9);
  switchSectionTransofrmerConnectorsOn(sec9);

  MyChains.Recalculate();


  expect(sec5.powered, sec5.name).to.equal(myNodeState.POWERED_OFF);
  expect(sec6.powered, sec6.name).to.equal(myNodeState.POWERED_OFF);
}


init(() => {
  const pss = myDataModelNodes.GetAllPSsAsArray();
  for (let i = 0; i < pss.length; i += 1) {
    const ps = pss[i];
    testPS(ps);
  }


  const leps = myDataModelNodes.GetAllLEPsAsArray();
  for (let i = 0; i < leps.length; i += 1) {
    const lep = leps[i];
    testLEP(lep);
  }


  schemaTestPoweringThroughLep();

  schemaTestPoweringThroughTransformer();

  schemaTestPoweringThroughSec2SecConnector();

  schemaTestPoweringCollisions();


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
