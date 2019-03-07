const chai = require('chai');
const mongoose = require('mongoose');

const expect = chai.expect;
const myDataModelNodes = require('../models/myDataModelNodes');
const lastValues = require('../values/lastValues');
const MyParamValue = require('../models/myParamValue');

const MyNodePropNameParamRole = require('../models/MyNodePropNameParamRole');
const myNodeState = require('../models/myNodeState');

// const paramValuesProcessor = require('../values/paramValuesProcessor');


const config = require('../../config');


let changedStates = [];


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
      myDataModelNodes.LoadFromDB((err) => {
        expect(err).to.equal(null);
        myDataModelNodes.SetStateChangedHandler((node, oldState, newState) => {
          console.info(`[debug] State changed for Node: ${node.name} from ${oldState} to ${newState}.`);
          changedStates.push({ node, oldState, newState });
        });
        const nodeSchemas = myDataModelNodes.GetNodeSchemas();
        for (let i = 0; i < nodeSchemas.length; i += 1) {
          const nodeSchema = nodeSchemas[i];
          const PSs = myDataModelNodes.GetSchemaPSs(nodeSchema.name);
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

              pspart.sec2secConnectors.forEach((connector) => {
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
  });


  describe('testing states for ParamState=OFF', () => {
    it('Should call statechangeHandle with new NodeState=OFF for correspondent linked node', (done) => {
      changedStates = [];

      const ps = myDataModelNodes.GetNode('ps1');
      if (!ps) {
        throw new Error('cannot find PS "ps1"!');
      }

      const paramName = 'param1_VV';
      let nodeName = null;

      ps.psparts.forEach((pspart) => {
        pspart.sections.forEach((section) => {
          section.connectors.forEach((connector) => {
            connector.equipments.forEach((equipment) => {
              if (equipment[MyNodePropNameParamRole.STATE] === paramName) {
                nodeName = equipment.name;
              }
            });
          });
        });
        if (!nodeName) {
          throw new Error(`cannot find linked node for param "${paramName}"!`);
        }
      });


      const param = myDataModelNodes.GetParam(paramName);
      if (param) {
        const pv = new MyParamValue(param.name, myNodeState.NODE_STATE_OFF, new Date(), '');
        lastValues.setRawValue(pv);

        ps.recalculateState();

        if (changedStates.length === 0) {
          throw new Error('no states has been changed!');
        }
        let b = false;
        for (let i = 0; i < changedStates.length; i += 1) {
          const node = changedStates[i].node;
          if (node.name === nodeName) {
            if (changedStates[i].newState === myNodeState.NODE_STATE_OFF) {
              b = true;
              break;
            }
          }
          // node, oldState, newState
        }
        if (!b) throw new Error('no states has been changed!');
      } else {
        throw new Error(`cannot find param "${paramName}"!`);
      }

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
