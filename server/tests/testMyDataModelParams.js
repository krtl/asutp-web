const chai = require('chai');
const mongoose = require('mongoose');


// obsolete!

const expect = chai.expect;
const myDataModelNodes = require('../models/myDataModelNodes');
const myDataModelSchemas = require('../models/myDataModelSchemas');
const DBNodeSchema = require('../dbmodels/nodeSchema');
const Param = require('../dbmodels/param');
const User = require('../dbmodels/authUser');


const config = require('../../config');

const testUserName = 'TestUserName';
const testParamName = 'TestParamName';
const testParamListName = 'TestParamListName';


describe('myDataModelNodes', () => {
  it('GetAvailableSchemas() should return 0 before loaded with data', () => {
    const schemas = myDataModelSchemas.GetAvailableSchemas('TestUser');
    expect(schemas.length).to.equal(0);
  });

  before((done) => {
    // plug in the promise library:
    mongoose.Promise = global.Promise;

    // mongoose.set('useNewUrlParser', true);
    //mongoose.set('useFindAndModify', false);
    // mongoose.set('useCreateIndex', true);
    // mongoose.set('useUnifiedTopology', true);

    mongoose.connect(config.dbUri, {
      // useMongoClient: true,
      autoIndex: process.env.NODE_ENV !== 'production',
    });

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.on('connected', () => {
      console.info(`We are connected to ${config.dbUri}`);
      done();
    });
  });

  describe('Test one Param in one ParamList', () => {
    it('New User should be saved to database', (done) => {
      const testUser = User({
        email: 'test@test.test',
        name: testUserName,
        role: 'test user',
        might: 'TestParamListName',
      });

      testUser.save(done);
    });


    it('New Param should be saved to database', (done) => {
      const testParam = Param({
        name: testParamName,
        caption: 'TestParamCaption',
        description: 'TestParamDescription',
        type: 'TestParamType',
      });

      testParam.save(done);
    });


    it('New ParamList should be saved to database', (done) => {
      const testParamList = DBNodeSchema({
        name: testParamListName,
        caption: 'TestParamListCaption',
        description: 'TestParamListDescription',
        paramNames: 'TestParamName',
      });

      testParamList.save(done);
    });

    it('Should retrieve ParamList and Param for TestUser after Loading DataModel', (done) => {
      myDataModelNodes.LoadFromDB((err) => {
        if (err) { throw err; }
        const schemas = myDataModelSchemas.GetAvailableSchemas(testUserName);
        if (schemas.length !== 1) { throw new Error('No data!'); }
        done();
      });
    });

    it('Should remove test Param', (done) => {
      Param.remove({ name: testParamName }, (err) => {
        if (err) { throw err; }
        done();
      });
    });

    it('Should remove test ParamList', (done) => {
      DBNodeSchema.remove({ name: testParamListName }, (err) => {
        if (err) { throw err; }
        done();
      });
    });

    it('Should remove test User', (done) => {
      User.remove({ name: testUserName }, (err) => {
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
