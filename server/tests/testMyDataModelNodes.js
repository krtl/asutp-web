const chai = require('chai');
const mongoose = require('mongoose');

const expect = chai.expect;
const myDataModelNodes = require('../models/myDataModelNodes');
// const ParamList = require('../dbmodels/paramList');
// const Param = require('../dbmodels/param');
// const User = require('../dbmodels/authUser');


const config = require('../../config');

// const testUserName = 'TestUserName';
// const testParamName = 'TestParamName';
// const testParamListName = 'TestParamListName';


describe('myDataModelNodes', () => {
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

  describe('Testing DataModelNodes', () => {
    it('Should Load model from DB withour errors', (done) => {
      myDataModelNodes.LoadFromDB((err) => {
        expect(err).to.equal(null);

        // const pLists = myDataModelNodes.getAvailableParamsLists(testUserName);
        // if (pLists.length !== 1) { throw new Error('No data!'); }
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
