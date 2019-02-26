const chai = require('chai');
const mongoose = require('mongoose');

const expect = chai.expect;
const myDataModelNodes = require('../models/myDataModelNodes');


const config = require('../../config');


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
