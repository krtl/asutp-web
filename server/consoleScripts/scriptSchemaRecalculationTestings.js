const chai = require('chai');
const mongoose = require('mongoose');
const moment = require('moment');

const expect = chai.expect;
const myDataModelNodes = require('../models/myDataModelNodes');
const paramValuesProcessor = require('../values/paramValuesProcessor');
// const lastValues = require('../values/lastValues');
// const MyParamValue = require('../models/myParamValue');
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

      paramValuesProcessor.initializeParamValuesProcessor({ useStompServer: false, useDbValueTracker: false });
      done();
    });
  });
});

function switchConnectorOn(connector) {
  expect(connector).to.be.an('object');
  connector.SetManualValue({ nodeName: connector.name, cmd: 'unblock', manualValue: 1 });
  expect(connector.IsSwitchedOn()).to.equal(true);
}

function switchConnectorOff(connector) {
  expect(connector).to.be.an('object');
  connector.SetManualValue({ nodeName: connector.name, cmd: 'unblock', manualValue: 0 });
  expect(connector.IsSwitchedOn()).to.equal(false);
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

function unpowerExternalLepsForSection(section) {
  for (let l = 0; l < section.connectors.length; l += 1) {
    const connector = section.connectors[l];
    if (connector.lep2PsConnector) {
      const lep = connector.lep2PsConnector.parentNode;
      lep.powered = myNodeState.POWERED_OFF;
    }
  }
}

function powerExternalLepsForSection(section) {
  for (let l = 0; l < section.connectors.length; l += 1) {
    const connector = section.connectors[l];
    if (connector.lep2PsConnector) {
      const lep = connector.lep2PsConnector.parentNode;
      lep.powered = myNodeState.POWERED_ON;
    }
  }
}

function unpowerExternalLeps(ps) {
  for (let i = 0; i < ps.psparts.length; i += 1) {
    const pspart = ps.psparts[i];
    for (let k = 0; k < pspart.sections.length; k += 1) {
      const section = pspart.sections[k];
      for (let l = 0; l < section.connectors.length; l += 1) {
        const connector = section.connectors[l];
        if (connector.lep2PsConnector) {
          const lep = connector.lep2PsConnector.parentNode;
          lep.powered = myNodeState.POWERED_OFF;
        }
      }
    }
  }
}


function testConnector(connector) {
  expect(connector).to.be.an('object');

  switchConnectorOn(connector);
  switchConnectorOff(connector);
}

function testSection(section) {
  expect(section).to.be.an('object');

  for (let l = 0; l < section.connectors.length; l += 1) {
    const connector = section.connectors[l];
    testConnector(connector);
  }

  if (section[MyNodePropNameParamRole.VOLTAGE] !== '') {
    switchSectionConnectorsOn(section);
    switchSectionTransofrmerConnectorsOn(section);
    section.SetManualValue({ nodeName: section.name, cmd: 'unblock', manualValue: 1 });
    section.recalculatePoweredState();
    section.setPoweredStateForConnectors();
    expect(section.powered).to.equal(myNodeState.POWERED_ON);
    for (let l = 0; l < section.connectors.length; l += 1) {
      const connector = section.connectors[l];
      expect(connector.powered).to.equal(myNodeState.POWERED_ON);
    }
    section.SetManualValue({ nodeName: section.name, cmd: 'unblock', manualValue: 0 });
    section.recalculatePoweredState();
    section.setPoweredStateForConnectors();
    expect(section.powered).to.equal(myNodeState.POWERED_OFF);
    for (let l = 0; l < section.connectors.length; l += 1) {
      const connector = section.connectors[l];
      expect(connector.powered).to.equal(myNodeState.POWERED_OFF);
    }
    switchSectionConnectorsOff(section);
    switchSectionTransofrmerConnectorsOff(section);
    section.SetManualValue({ nodeName: section.name, cmd: 'unblock', manualValue: 1 });
    section.recalculatePoweredState();
    section.setPoweredStateForConnectors();
    expect(section.powered).to.equal(myNodeState.POWERED_ON);
    for (let l = 0; l < section.connectors.length; l += 1) {
      const connector = section.connectors[l];
      expect(connector.powered).to.equal(myNodeState.POWERED_OFF);
    }
  } else {
    powerExternalLepsForSection(section);
    switchSectionTransofrmerConnectorsOff(section);
    switchSectionConnectorsOn(section);
    section.recalculatePoweredState();
    section.setPoweredStateForConnectors();
    expect(section.powered).to.equal(myNodeState.POWERED_ON);
    for (let l = 0; l < section.connectors.length; l += 1) {
      const connector = section.connectors[l];
      if (!connector.transformerConnector) {
        expect(connector.powered).to.equal(myNodeState.POWERED_ON);
      } else {
        expect(connector.powered).to.equal(myNodeState.POWERED_OFF);
      }
    }
    switchSectionConnectorsOff(section);
    switchSectionTransofrmerConnectorsOff(section);
    section.recalculatePoweredState();
    section.setPoweredStateForConnectors();
    expect(section.powered).to.equal(myNodeState.POWERED_OFF);
    for (let l = 0; l < section.connectors.length; l += 1) {
      const connector = section.connectors[l];
      expect(connector.powered).to.equal(myNodeState.POWERED_OFF);
    }

    unpowerExternalLepsForSection(section);
    switchSectionConnectorsOn(section);
    switchSectionTransofrmerConnectorsOn(section);
    section.recalculatePoweredState();
    section.setPoweredStateForConnectors();
    expect(section.powered).to.equal(myNodeState.POWERED_OFF);
    for (let l = 0; l < section.connectors.length; l += 1) {
      const connector = section.connectors[l];
      expect(connector.powered).to.equal(myNodeState.POWERED_OFF);
    }

    switchSectionConnectorsOff(section);
    switchSectionTransofrmerConnectorsOff(section);
    section.recalculatePoweredState();
    section.setPoweredStateForConnectors();
    expect(section.powered).to.equal(myNodeState.POWERED_OFF);
    for (let l = 0; l < section.connectors.length; l += 1) {
      const connector = section.connectors[l];
      expect(connector.powered).to.equal(myNodeState.POWERED_OFF);
    }
  }
  // } else {
  //   section.recalculatePoweredState();
  //   expect(section.powered).to.equal(myNodeState.POWERED_UNKNOWN);
  // }
}

function getsectionLep(section) {
  for (let i = 0; i < section.connectors.length; i += 1) {
    const connector = section.connectors[i];
    if (!connector.transformerConnector) {
      if (connector.lep2PsConnector) {
        return connector.lep2PsConnector.parentNode;
      }
    }
  }
  return undefined;
}

function testSec2SecConnector(sec2secConnector) {
  const ps = sec2secConnector.parentNode.parentNode;

  testConnector(sec2secConnector);

  expect(sec2secConnector.fromSection).to.be.an('object');
  expect(sec2secConnector.toSection).to.be.an('object');

  const lep1 = getsectionLep(sec2secConnector.fromSection);
  const lep2 = getsectionLep(sec2secConnector.toSection);
  expect(lep1).to.be.an('object');
  expect(lep2).to.be.an('object');

  switchSectionConnectorsOn(sec2secConnector.fromSection);
  switchSectionConnectorsOn(sec2secConnector.toSection);

  if (sec2secConnector.fromSection[MyNodePropNameParamRole.VOLTAGE] !== '') {
    sec2secConnector.fromSection.SetManualValue({ nodeName: sec2secConnector.fromSection.name, cmd: 'unblock', manualValue: 0 });
  } else {
    lep1.powered = myNodeState.POWERED_OFF;
  }
  if (sec2secConnector.toSection[MyNodePropNameParamRole.VOLTAGE] !== '') {
    sec2secConnector.toSection.SetManualValue({ nodeName: sec2secConnector.toSection.name, cmd: 'unblock', manualValue: 0 });
  } else {
    lep2.powered = myNodeState.POWERED_OFF;
  }

  switchConnectorOff(sec2secConnector);
  ps.recalculatePoweredState();
  expect(sec2secConnector.fromSection.powered).to.equal(myNodeState.POWERED_OFF);
  expect(sec2secConnector.toSection.powered).to.equal(myNodeState.POWERED_OFF);
  expect(sec2secConnector.powered).to.equal(myNodeState.POWERED_OFF);
  switchConnectorOn(sec2secConnector);
  ps.recalculatePoweredState();
  expect(sec2secConnector.powered).to.equal(myNodeState.POWERED_OFF);

  if (sec2secConnector.fromSection[MyNodePropNameParamRole.VOLTAGE] !== '') {
    sec2secConnector.fromSection.SetManualValue({ nodeName: sec2secConnector.fromSection.name, cmd: 'unblock', manualValue: 1 });
  } else {
    lep1.powered = myNodeState.POWERED_ON;
  }
  if (sec2secConnector.toSection[MyNodePropNameParamRole.VOLTAGE] !== '') {
    sec2secConnector.toSection.SetManualValue({ nodeName: sec2secConnector.toSection.name, cmd: 'unblock', manualValue: 0 });
  } else {
    lep2.powered = myNodeState.POWERED_OFF;
  }

  switchConnectorOn(sec2secConnector);
  ps.recalculatePoweredState();
  expect(sec2secConnector.fromSection.powered).to.equal(myNodeState.POWERED_ON);
  if (sec2secConnector.fromSection[MyNodePropNameParamRole.VOLTAGE] !== '') {
    expect(sec2secConnector.toSection.powered).to.equal(myNodeState.POWERED_OFF);
  } else {
    expect(sec2secConnector.toSection.powered).to.equal(myNodeState.POWERED_ON);
  }
  expect(sec2secConnector.powered).to.equal(myNodeState.POWERED_ON);


  if (sec2secConnector.fromSection[MyNodePropNameParamRole.VOLTAGE] !== '') {
    sec2secConnector.fromSection.SetManualValue({ nodeName: sec2secConnector.fromSection.name, cmd: 'unblock', manualValue: 0 });
  } else {
    lep1.powered = myNodeState.POWERED_OFF;
  }
  if (sec2secConnector.toSection[MyNodePropNameParamRole.VOLTAGE] !== '') {
    sec2secConnector.toSection.SetManualValue({ nodeName: sec2secConnector.toSection.name, cmd: 'unblock', manualValue: 1 });
  } else {
    lep2.powered = myNodeState.POWERED_ON;
  }

  switchConnectorOn(sec2secConnector);
  ps.recalculatePoweredState();
  if (sec2secConnector.fromSection[MyNodePropNameParamRole.VOLTAGE] !== '') {
    expect(sec2secConnector.fromSection.powered).to.equal(myNodeState.POWERED_OFF);
  } else {
    expect(sec2secConnector.fromSection.powered).to.equal(myNodeState.POWERED_ON);
  }
  expect(sec2secConnector.powered).to.equal(myNodeState.POWERED_ON);


  if (sec2secConnector.fromSection[MyNodePropNameParamRole.VOLTAGE] !== '') {
    sec2secConnector.fromSection.SetManualValue({ nodeName: sec2secConnector.fromSection.name, cmd: 'unblock', manualValue: 0 });
  } else {
    lep1.powered = myNodeState.POWERED_OFF;
  }
  if (sec2secConnector.toSection[MyNodePropNameParamRole.VOLTAGE] !== '') {
    sec2secConnector.toSection.SetManualValue({ nodeName: sec2secConnector.toSection.name, cmd: 'unblock', manualValue: 1 });
  } else {
    lep2.powered = myNodeState.POWERED_ON;
  }

  switchConnectorOff(sec2secConnector);
  ps.recalculatePoweredState();
  expect(sec2secConnector.fromSection.powered).to.equal(myNodeState.POWERED_OFF);
  expect(sec2secConnector.toSection.powered).to.equal(myNodeState.POWERED_ON);
  expect(sec2secConnector.powered).to.equal(myNodeState.POWERED_OFF);

  if (sec2secConnector.fromSection[MyNodePropNameParamRole.VOLTAGE] !== '') {
    sec2secConnector.fromSection.SetManualValue({ nodeName: sec2secConnector.fromSection.name, cmd: 'unblock', manualValue: 1 });
  } else {
    lep1.powered = myNodeState.POWERED_ON;
  }
  if (sec2secConnector.toSection[MyNodePropNameParamRole.VOLTAGE] !== '') {
    sec2secConnector.toSection.SetManualValue({ nodeName: sec2secConnector.toSection.name, cmd: 'unblock', manualValue: 0 });
  } else {
    lep2.powered = myNodeState.POWERED_OFF;
  }

  switchConnectorOff(sec2secConnector);
  ps.recalculatePoweredState();
  expect(sec2secConnector.fromSection.powered).to.equal(myNodeState.POWERED_ON);
  expect(sec2secConnector.toSection.powered).to.equal(myNodeState.POWERED_OFF);
  expect(sec2secConnector.powered).to.equal(myNodeState.POWERED_OFF);
}

function testTransformer(transformer) {
  const ps = transformer.parentNode;

  for (let i = 0; i < ps.psparts.length; i += 1) {
    const pspart = ps.psparts[i];
    for (let l = 0; l < pspart.sec2secConnectors.length; l += 1) {
      const sec2secConnector = pspart.sec2secConnectors[l];
      switchConnectorOff(sec2secConnector);
    }
  }

  for (let i = 0; i < transformer.transConnectors.length; i += 1) {
    const transConnector = transformer.transConnectors[i];
    const section = transConnector.toConnector.parentNode;
    const pspart = section.parentNode;
    switchSectionTransofrmerConnectorsOn(section);
    if (pspart.inputNotOutput) {
      switchConnectorOn(transConnector.toConnector);
      if (section[MyNodePropNameParamRole.VOLTAGE] !== '') {
        section.SetManualValue({ nodeName: section.name, cmd: 'unblock', manualValue: 1 });
      } else {
        powerExternalLepsForSection(section);
        switchSectionConnectorsOn(section);
      }
    } else {
      switchSectionConnectorsOff(section);
    }
  }

  ps.recalculatePoweredState();

  for (let i = 0; i < transformer.transConnectors.length; i += 1) {
    const transConnector = transformer.transConnectors[i];
    const section = transConnector.toConnector.parentNode;
    const pspart = section.parentNode;
    if (!pspart.inputNotOutput) {
      if (section[MyNodePropNameParamRole.VOLTAGE] === '') {
        expect(section.powered).to.equal(myNodeState.POWERED_ON);
      }
    }
  }

  for (let i = 0; i < transformer.transConnectors.length; i += 1) {
    const transConnector = transformer.transConnectors[i];
    const section = transConnector.toConnector.parentNode;
    const pspart = section.parentNode;
    switchSectionTransofrmerConnectorsOff(section);
    if (pspart.inputNotOutput) {
      switchConnectorOn(transConnector.toConnector);
      if (section[MyNodePropNameParamRole.VOLTAGE] !== '') {
        section.SetManualValue({ nodeName: section.name, cmd: 'unblock', manualValue: 1 });
      } else {
        powerExternalLepsForSection(section);
        switchSectionConnectorsOn(section);
      }
    } else {
      switchSectionConnectorsOff(section);
    }
  }

  ps.recalculatePoweredState();

  for (let i = 0; i < transformer.transConnectors.length; i += 1) {
    const transConnector = transformer.transConnectors[i];
    const section = transConnector.toConnector.parentNode;
    const pspart = section.parentNode;
    if (!pspart.inputNotOutput) {
      if (section[MyNodePropNameParamRole.VOLTAGE] === '') {
        expect(section.powered).to.equal(myNodeState.POWERED_OFF);
      }
    }
  }
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

  for (let i = 0; i < lep.lep2lepConnectors.length; i += 1) {
    const connector = lep.lep2lepConnectors[i];
    connector.powered = myNodeState.POWERED_OFF;
    connector.toNode.powered = myNodeState.POWERED_OFF;
  }
  for (let i = 0; i < lep.lep2psConnectors.length; i += 1) {
    const connector = lep.lep2psConnectors[i];
    connector.powered = myNodeState.POWERED_OFF;
    connector.toNodeConnector.powered = myNodeState.POWERED_OFF;
  }

  lep.recalculatePoweredState();
  try {
    expect(lep.powered).to.equal(myNodeState.POWERED_OFF);
  } catch {
    setError('');
  }

  for (let i = 0; i < lep.lep2psConnectors.length; i += 1) {
    const connector = lep.lep2psConnectors[i];
    // connector.powered = myNodeState.POWERED_OFF;
    if (i===0) {
      connector.toNodeConnector.powered = myNodeState.POWERED_ON;
    } else {
      connector.toNodeConnector.powered = myNodeState.POWERED_OFF;
    }
  }

  lep.recalculatePoweredState();
  try {
    if (lep.lep2psConnectors.length > 0) {
      expect(lep.powered).to.equal(myNodeState.POWERED_ON);
    } else {
      expect(lep.powered).to.equal(myNodeState.POWERED_OFF);
    }    
  } catch {
    setError('');
  }


//.. other tests here  

// switch off lep2lep connection to not affect of other leps

  resetSchema();

  lep.recalculatePoweredState();
  try {
    expect(lep.powered).to.equal(myNodeState.POWERED_OFF);
  } catch {
    setError('');
  }
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

  const leps = myDataModelNodes.GetAllLEPsAsArray();
  for (let i = 0; i < leps.length; i += 1) {
    const lep = leps[i];
    for (let i = 0; i < lep.lep2lepConnectors.length; i += 1) {
      const connector = lep.lep2lepConnectors[i];
      connector.powered = myNodeState.POWERED_OFF;
      connector.toNode.powered = myNodeState.POWERED_OFF;
    }
    for (let i = 0; i < lep.lep2psConnectors.length; i += 1) {
      const connector = lep.lep2psConnectors[i];
      connector.powered = myNodeState.POWERED_OFF;
      connector.toNodeConnector.powered = myNodeState.POWERED_OFF;
    }
  }

}

function schemaTest1() {

  resetSchema();

  myDataModelNodes.RecalculateWholeShema();


  const pss = myDataModelNodes.GetAllPSsAsArray();
  for (let i = 0; i < pss.length; i += 1) {
    const ps = pss[i];
    expect(ps.powered).to.equal(myNodeState.POWERED_OFF);
  }

  const leps = myDataModelNodes.GetAllLEPsAsArray();
  for (let i = 0; i < leps.length; i += 1) {
    const lep = leps[i];
    expect(lep.powered).to.equal(myNodeState.POWERED_OFF);
  }

  
  const connector = myDataModelNodes.GetNode('ps1part110sec1c2')
  const section = myDataModelNodes.GetNode('ps1part110sec1');
  
  connector.SetManualValue({ nodeName: 'ps1part110sec1c2', cmd: 'unblock', manualValue: 1 });
  section.SetManualValue({ nodeName: 'ps1part110sec1', cmd: 'unblock', manualValue: 1 });

  myDataModelNodes.RecalculateWholeShema();

  const lep1 = myDataModelNodes.GetNode('lep110_1');
  expect(lep1.powered).to.equal(myNodeState.POWERED_ON);
  const lep2 = myDataModelNodes.GetNode('lep110_2');
  expect(lep2.powered).to.equal(myNodeState.POWERED_ON);

  const sec1 = myDataModelNodes.GetNode('ps4part110sec1');
  switchSectionConnectorsOn(sec1);
  
  myDataModelNodes.RecalculateWholeShema();

  expect(sec1.powered).to.equal(myNodeState.POWERED_ON);


}

init(() => {
//  const ps = myDataModelNodes.GetNode('ps4');
//  unpowerExternalLeps(ps);
//  testPS(ps);

  const pss = myDataModelNodes.GetAllPSsAsArray();
  for (let i = 0; i < pss.length; i += 1) {
    const ps = pss[i];
    testPS(ps);
  }



  const leps = myDataModelNodes.GetAllLEPsAsArray();
  for (let i = 0; i < leps.length; i += 1) {
    const lep = leps[i];
    lep.powered = myNodeState.POWERED_OFF;
  }
  
  for (let i = 0; i < leps.length; i += 1) {
    const lep = leps[i];
    testLEP(lep);
  }


  schemaTest1();



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
