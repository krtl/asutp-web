const chai = require('chai');
const mongoose = require('mongoose');

const expect = chai.expect;
const myDataModelNodes = require('../models/myDataModelNodes');
const paramValuesProcessor = require('../values/paramValuesProcessor');
const lastValues = require('../values/lastValues');
const MyParamValue = require('../models/myParamValue');
const myNodeState = require('../models/myNodeState');


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

        paramValuesProcessor.initializeParamValuesProcessor();
        done();
      });
    });
  });

  function testSection1(sectionName) {

  }

  describe('TestSection1', () => {
    it('Should change section state', (done) => {
      const param = myDataModelNodes.GetParam('paramPS1Part110sec1_Ul');
      const ps = myDataModelNodes.GetNode('ps1');
      const node = myDataModelNodes.GetNode('ps1part110sec1');
      expect(param).to.be.an('object');
      expect(ps).to.be.an('object');
      expect(node).to.be.an('object');
      expect(node.powered).to.equal(myNodeState.POWERED_UNKNOWN);

      lastValues.setRawValue(new MyParamValue(param.name, 110, new Date(), ''));
      ps.recalculatePoweredState();
      expect(node.powered).to.equal(myNodeState.POWERED_ON);

      lastValues.setRawValue(new MyParamValue(param.name, 0, new Date(), ''));
      ps.recalculatePoweredState();
      expect(node.powered).to.equal(myNodeState.POWERED_OFF);

      testSection1('ps1part110sec1');

      done();
    });
  });


  after((done) => {
    mongoose.connection.close(done);
  });
});
