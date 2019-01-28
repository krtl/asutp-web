const chai = require('chai');
const mongoose = require('mongoose');

const expect = chai.expect;
const myDataModelNodes = require('../models/myDataModelNodes');
const myDataModelParams = require('../models/myDataModelParams');
const lastValues = require('../values/lastValues');
const MyParamValue = require('../models/myParamValue');

// const paramValuesProcessor = require('../values/paramValuesProcessor');

// const ParamList = require('../dbmodels/paramList');
// const Param = require('../dbmodels/param');
// const User = require('../dbmodels/authUser');


const config = require('../../config');

// const testUserName = 'TestUserName';
// const testParamName = 'TestParamName';
// const testParamListName = 'TestParamListName'

const changedStates = [];


describe('nodeState', () => {
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

  describe('Loading NodesModel', () => {
    it('Should Load NodesModel from DB withour errors', (done) => {
      myDataModelNodes.LoadFromDB((err) => {
        expect(err).to.equal(null);

        // const pLists = myDataModelNodes.getAvailableParamsLists(testUserName);
        // if (pLists.length !== 1) { throw new Error('No data!'); }
        done();
      });
    });
  });

  describe('Loading ParamsModel', () => {
    it('Should Load ParamsModel from DB withour errors', (done) => {
      myDataModelParams.LoadFromDB((err) => {
        expect(err).to.equal(null);

        // const pLists = myDataModelNodes.getAvailableParamsLists(testUserName);
        // if (pLists.length !== 1) { throw new Error('No data!'); }
        done();
      });
    });
  });


  describe('setting state handler', () => {
    it('Should set stateHandler for each node', (done) => {
      myDataModelNodes.SetStateChangedHandler((node, oldState, newState) => {
        console.info(`[debug] State changed for Node: ${node} from ${oldState} to ${newState}.`);
        changedStates.push({ node, oldState, newState });
      });
      const regions = myDataModelNodes.GetRegions();
      for (let i = 0; i < regions.length; i += 1) {
        const region = regions[i];
        const PSs = myDataModelNodes.GetRegionPSs(region.name);
        for (let j = 0; j < PSs.length; j += 1) {
          const ps = PSs[j];
          if (ps.stateChangeHandler === undefined) {
            throw new Error(`There is no stateChangeHandler for ${ps.name}!`);
          }

          ps.psparts.forEach((pspart) => {
            if (pspart.stateChangeHandler === undefined) {
              throw new Error(`There is no stateChangeHandler for ${pspart.name}!`);
            }

            pspart.sections.forEach((section) => {
              if (section.stateChangeHandler === undefined) {
                throw new Error(`There is no stateChangeHandler for ${section.name}!`);
              }
              section.connectors.forEach((connector) => {
                if (connector.stateChangeHandler === undefined) {
                  throw new Error(`There is no stateChangeHandler for ${connector.name}!`);
                }

                connector.equipments.forEach((equipment) => {
                  if (equipment.stateChangeHandler === undefined) {
                    throw new Error(`There is no stateChangeHandler for ${equipment.name}!`);
                  }
                });
              });
            });

            pspart.connectors.forEach((connector) => {
              if (connector.stateChangeHandler === undefined) {
                throw new Error(`There is no stateChangeHandler for ${connector.name}!`);
              }

              connector.equipments.forEach((equipment) => {
                if (equipment.stateChangeHandler === undefined) {
                  throw new Error(`There is no stateChangeHandler for ${equipment.name}!`);
                }
              });
            });
          });
          ps.transformers.forEach((transformer) => {
            if (transformer.stateChangeHandler === undefined) {
              throw new Error(`There is no stateChangeHandler for ${transformer.name}!`);
            }
          });
        }
      }

      done();
    });
  });


  describe('testing states for VV1=0', () => {
    it('Should Load ParamsModel from DB withour errors', (done) => {
      this.changedStates = [];
      const ps = myDataModelNodes.GetNode('ps1');
      if (!ps) {
        throw new Error('cannot find PS "ps1"!');
      }

      const param = myDataModelParams.getParam('param1_VV');
      if (param) {
        const pv = new MyParamValue(param.name, 0, new Date(), '');
        lastValues.setLastValue(pv);
        ps.recalculateState();
        if (this.changedStates.length === 0) {
          throw new Error('no states has been changed!');
        }
        for (let i = 0; i < this.changedStates.length; i += 1) {
          console.log(this.changedStates[i]);
        }
      } else {
        throw new Error('cannot find param "param1_VV"!');
      }

        // const pLists = myDataModelNodes.getAvailableParamsLists(testUserName);
        // if (pLists.length !== 1) { throw new Error('No data!'); }
      done();
    });
  });

  // After all tests are finished drop database and close connection
  after((done) => {
//    mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(done);
//    });
  });
});
