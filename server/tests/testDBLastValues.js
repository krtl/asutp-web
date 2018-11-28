const mongoose = require('mongoose');
const moment = require('moment');
const dbValues = require('../dbInsertor/dbValues');

// const Schema = mongoose.Schema;
// const chai = require('chai');

// const expect = chai.expect;
const config = require('../../config');
const ParamValue = require('../dbmodels/paramValue');
const MyParamValue = require('../models/myParamValue');

const TESTPARAMNAME = 'testParam3245646';
const TESTPARAMVALUE = 333.333;
const TESTPARAMVALUE1 = 111.111;
const TESTPARAMVALUE2 = 333.333;
const TESTPARAMVALUE_AVERAGE_1_2 = 222.222;
const TESTPARAMQD = 'NA';
const TESTDT = moment().minutes(0).seconds(0).milliseconds(0);


describe('Database Test ParamValues', () => {
  // Before starting the test, create a sandboxed database connection
  // Once a connection is established invoke done()
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
      done();
    });
  });

  describe('Test saveValue function', () => {
    it('delete old test value', (done) => {
      ParamValue.deleteMany({ paramName: TESTPARAMNAME }, (err) => {
        if (err) { throw err; }
        done();
      });
    });

    it('save test value', (done) => {
      const pv = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE, TESTDT, TESTPARAMQD);
      dbValues.saveValue(pv, (err) => {
        if (err) { throw err; }
        done();
      });
    });

    it('get test value', (done) => {
      ParamValue.findOne({ paramName: TESTPARAMNAME }, (err, paramValue) => {
        if (err) { throw err; }
        if (paramValue.paramName !== TESTPARAMNAME) { throw new Error('Wrong Name!'); }
        if (paramValue.value !== TESTPARAMVALUE) { throw new Error('Wrong Value!'); }
        if (!moment(paramValue.dt).isSame(moment(TESTDT))) { throw new Error('Wrong DT!'); }
        if (paramValue.qd !== TESTPARAMQD) { throw new Error('Wrong QD!'); }
        done();
      });
    });

    it('delete test value', (done) => {
      ParamValue.deleteMany({ paramName: TESTPARAMNAME }, (err) => {
        if (err) { throw err; }
        done();
      });
    });
  });

  describe('Test updateAverageValue function', () => {
    it('delete old test values if any', (done) => {
      ParamValue.deleteMany({ paramName: TESTPARAMNAME }, (err) => {
        if (err) { throw err; }
        done();
      });
    });

    it('update should save test value', (done) => {
      const pv = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE1, TESTDT, TESTPARAMQD);
      dbValues.updateAverageValue(pv, (err) => {
        if (err) { throw err; }
        done();
      });
    });

    it('get test value', (done) => {
      ParamValue.findOne({ paramName: TESTPARAMNAME }, (err, paramValue) => {
        if (err) { throw err; }
        if (paramValue.paramName !== TESTPARAMNAME) { throw new Error('Wrong Name!'); }
        if (paramValue.value !== TESTPARAMVALUE1) { throw new Error('Wrong Value!'); }
        if (!moment(paramValue.dt).isSame(moment(TESTDT))) { throw new Error('Wrong DT!'); }
        if (paramValue.qd !== TESTPARAMQD) { throw new Error('Wrong QD!'); }
        done();
      });
    });

    it('update should update test value', (done) => {
      const pv = new MyParamValue(TESTPARAMNAME, TESTPARAMVALUE2, TESTDT, TESTPARAMQD);
      dbValues.updateAverageValue(pv, (err) => {
        if (err) { throw err; }
        done();
      });
    });

    it('get average value', (done) => {
      ParamValue.findOne({ paramName: TESTPARAMNAME }, (err, paramValue) => {
        if (err) { throw err; }
        if (paramValue.paramName !== TESTPARAMNAME) { throw new Error('Wrong Name!'); }
        if (paramValue.value !== TESTPARAMVALUE_AVERAGE_1_2) { throw new Error('Wrong Value!'); }
        if (!moment(paramValue.dt).isSame(moment(TESTDT))) { throw new Error('Wrong DT!'); }
        if (paramValue.qd !== TESTPARAMQD) { throw new Error('Wrong QD!'); }
        done();
      });
    });

    it('delete test value', (done) => {
      ParamValue.deleteMany({ paramName: TESTPARAMNAME }, (err) => {
        if (err) { throw err; }
        done();
      });
    });
  });


  // After all tests are finished drop database and close connection
  after((done) => {
//    mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(done);
//    });
  });
});
