const chai = require('chai');
const mongoose = require('mongoose');

const expect = chai.expect;
const myDataModelNodes = require('../models/myDataModelNodes');
const paramValuesProcessor = require('../values/paramValuesProcessor');
const lastValues = require('../values/lastValues');
const MyParamValue = require('../models/myParamValue');
const myNodeState = require('../models/myNodeState');
const MyNodePropNameParamRole = require('../models/MyNodePropNameParamRole');


const config = require('../../config');


describe('mySchemaRecalculation', () => {
  before((done) => {
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

    for (let m = 0; m < connector.equipments.length; m += 1) {
      const equipment = connector.equipments[m];
      if (MyNodePropNameParamRole.STATE in equipment) {
        if (equipment[MyNodePropNameParamRole.STATE] !== '') {
          const param = myDataModelNodes.GetParam(equipment[MyNodePropNameParamRole.STATE]);
          lastValues.setRawValue(new MyParamValue(param.name, 1, new Date(), ''));
          expect(equipment.isSwitchedOn()).to.equal(true);
        }
      }
    }
  }

  function testSwitchConnectorOff(connector) {
    expect(connector).to.be.an('object');

    for (let m = 0; m < connector.equipments.length; m += 1) {
      const equipment = connector.equipments[m];
      if (MyNodePropNameParamRole.STATE in equipment) {
        if (equipment[MyNodePropNameParamRole.STATE] !== '') {
          const param = myDataModelNodes.GetParam(equipment[MyNodePropNameParamRole.STATE]);
          lastValues.setRawValue(new MyParamValue(param.name, 0, new Date(), ''));
          expect(equipment.isSwitchedOn()).to.equal(false);
        }
      }
    }
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
        expect(connector.powered).to.equal(myNodeState.POWERED_ON);
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

  describe('TestAllPSs', () => {
    it('Should change section state', (done) => {
      const pss = myDataModelNodes.GetAllPSsAsArray();
      for (let i = 0; i < pss.length; i += 1) {
        const ps = pss[i];
        testPS(ps);
      }

      done();
    });
  });


  after((done) => {
    mongoose.connection.close(done);
  });
});
