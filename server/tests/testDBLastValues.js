const mongoose = require('mongoose');
const async = require('async');

// const Schema = mongoose.Schema;
// const chai = require('chai');

// const expect = chai.expect;
const config = require('../../config');

// require('mongoose').model('AuthUser');  // eslint-disable-line global-require
const ParamValue = require('../dbmodels/paramValue');


// Create a new schema that accepts a 'name' object.
// 'name' is a required field
// const testSchema = new Schema({
//   name: { type: String, required: true },
// });

// Create a new collection called 'Name'
// const Name = mongoose.model('Name', testSchema);


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

  describe('Test one ParamValue', () => {
    // Save object with 'name' value of 'TestName593"
    it('New Param Value with origin name should be saved to database', (done) => {
      const testParamValue = ParamValue({
        paramName: 'TestName593',
      });

      testParamValue.save(done);
    });

    it('Dont save incorrect format to database', (done) => {
      // Attempt to save with wrong info. An error should trigger
      const wrongSave = ParamValue({
        notName: 'Not TestName593',
      });
      wrongSave.save((err) => {
        if (err) { return done(); }
        throw new Error('Should generate error!');
      });
    });

    it('Should retrieve data from test database', (done) => {
      // Look up the 'TestName593' object previously saved.
      ParamValue.find({ paramName: 'TestName593' }, (err, name) => {
        if (err) { throw err; }
        if (name.length === 0) { throw new Error('No data!'); }
        done();
      });
    });

    it('Should remove test param values', (done) => {
      ParamValue.remove({ paramName: /^TestName/ }, (err) => {
        if (err) { throw err; }
        done();
      });
    });
  });

  describe('Test multiple ParamValues', () => {
    // test multiple random param values


    it('Should remove all previous test param values', (done) => {
      ParamValue.remove({ paramName: /^TestParam/ }, (err) => {
        if (err) { throw err; }
        done();
      });
    });

    it('Should retrieve no test param values', (done) => {
      ParamValue.count({ paramName: /^TestParam/ }, (err, count) => {
        if (err) { throw err; }
        if (count !== 0) { throw new Error('Wrong count!'); }
        done();
      });
    });

    it('should insert 100 test param values ', (done) => {
      const params = [];
      for (let i = 0; i < 100; i += 1) {
        params.push(i);
      }
      async.each(params, (paramData, done) => {
        const testParamValue = ParamValue({
          paramName: `TestParam${Math.floor(Math.random() * 1000)}`,
          // paramName: 'TestParam',
          value: (Math.random() * 1000) + paramData,
          qd: 'NV',
        });
        testParamValue.save(done);
      }, done);
    });

    it('Should retrieve correct count of test param values', (done) => {
      ParamValue.count({ paramName: /^TestParam/ }, (err, count) => {
        if (err) { throw err; }
        if (count !== 100) { throw new Error('Wrong count!'); }
        done();
      });
    });

    it('Should remove all previous test param values', (done) => {
      ParamValue.remove({ paramName: /^TestParam/ }, (err) => {
        if (err) { throw err; }
        done();
      });
    });

    it('Should retrieve zero of test param values', (done) => {
      ParamValue.count({ paramName: /^TestParam/ }, (err, count) => {
        if (err) { throw err; }
        if (count !== 0) { throw new Error('Wrong count!'); }
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
