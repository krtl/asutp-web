const chai = require("chai");
const mongoose = require("mongoose");

const { expect } = chai;
const myDataModelNodes = require("../models/myDataModelNodes");
const myDataModelSchemas = require("../models/myDataModelSchemas");
const lastValues = require("../serviceBackground/lastValues");
const MyParamValue = require("../models/myParamValue");

const MyNodePropNameParamRole = require("../models/MyNodePropNameParamRole");
const myNodeState = require("../models/myNodeState");

// const paramValuesProcessor = require('../values/paramValuesProcessor');

const config = require("../../config");

let changedStates = [];

describe("nodeState", () => {
  before(done => {
    // plug in the promise library:
    mongoose.Promise = global.Promise;

    // mongoose.set("useNewUrlParser", true);
    //mongoose.set("useFindAndModify", false);
    // mongoose.set("useCreateIndex", true);
    // mongoose.set("useUnifiedTopology", true);

    mongoose.connect(config.dbUri, {
      // useMongoClient: true,
      autoIndex: process.env.NODE_ENV !== "production"
    });

    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error"));
    db.on("connected", () => {
      console.info(`We are connected to ${config.dbUri}`);
      myDataModelNodes.LoadFromDB(err => {
        expect(err).to.equal(null);
        myDataModelNodes.SetStateChangedHandlers((node, oldState, newState) => {
          console.debug(
            `[] State changed for Node: ${node.name} from ${oldState} to ${newState}.`
          );
          changedStates.push({ node, oldState, newState });
        });
        myDataModelSchemas.LoadFromDB(err => {
          expect(err).to.equal(null);

          const nodeSchemas = myDataModelSchemas.GetNodeSchemas();
          for (let i = 0; i < nodeSchemas.length; i += 1) {
            const nodeSchema = nodeSchemas[i];
            const PSs = myDataModelSchemas.GetSchemaPSs(nodeSchema.name);
            for (let j = 0; j < PSs.length; j += 1) {
              const ps = PSs[j];
              if (ps.poweredStateChangeHandler === undefined) {
                throw new Error(
                  `There is no poweredStateChangeHandler for ${ps.name}!`
                );
              }

              ps.psparts.forEach(pspart => {
                if (pspart.poweredStateChangeHandler === undefined) {
                  throw new Error(
                    `There is no poweredStateChangeHandler for ${pspart.name}!`
                  );
                }

                pspart.sections.forEach(section => {
                  if (section.poweredStateChangeHandler === undefined) {
                    throw new Error(
                      `There is no poweredStateChangeHandler for ${section.name}!`
                    );
                  }
                  section.connectors.forEach(connector => {
                    if (connector.poweredStateChangeHandler === undefined) {
                      throw new Error(
                        `There is no poweredStateChangeHandler for ${connector.name}!`
                      );
                    }

                    connector.equipments.forEach(equipment => {
                      if (equipment.poweredStateChangeHandler === undefined) {
                        throw new Error(
                          `There is no poweredStateChangeHandler for ${equipment.name}!`
                        );
                      }
                    });
                  });
                });

                pspart.sec2secConnectors.forEach(connector => {
                  if (connector.poweredStateChangeHandler === undefined) {
                    throw new Error(
                      `There is no poweredStateChangeHandler for ${connector.name}!`
                    );
                  }

                  connector.equipments.forEach(equipment => {
                    if (equipment.poweredStateChangeHandler === undefined) {
                      throw new Error(
                        `There is no poweredStateChangeHandler for ${equipment.name}!`
                      );
                    }
                  });
                });
              });
              ps.transformers.forEach(transformer => {
                if (transformer.poweredStateChangeHandler === undefined) {
                  throw new Error(
                    `There is no poweredStateChangeHandler for ${transformer.name}!`
                  );
                }
              });
            }
          }
        });

        done();
      });
    });
  });

  describe("testing states for ParamState=OFF", () => {
    it("Should call statechangeHandle with new NodeState=OFF for correspondent linked node", done => {
      changedStates = [];

      const ps = myDataModelNodes.GetNode("ps1");
      if (!ps) {
        throw new Error('cannot find PS "ps1"!');
      }

      const paramName = "param_ps1Part110sec1c1_VV";
      let nodeName = null;

      ps.psparts.forEach(pspart => {
        pspart.sections.forEach(section => {
          section.connectors.forEach(connector => {
            connector.equipments.forEach(equipment => {
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
        const pv = new MyParamValue(
          param.name,
          myNodeState.POWERED_OFF,
          new Date(),
          ""
        );
        lastValues.setRawValue(pv);

        // this is outdated code
        // ps.recalculatePoweredState();

        if (changedStates.length === 0) {
          throw new Error("no states has been changed!");
        }
        let b = false;
        for (let i = 0; i < changedStates.length; i += 1) {
          const { node } = changedStates[i];
          if (node.name === nodeName) {
            if (changedStates[i].newState === myNodeState.POWERED_OFF) {
              b = true;
              break;
            }
          }
          // node, oldState, newState
        }
        if (!b) throw new Error("no states has been changed!");
      } else {
        throw new Error(`cannot find param "${paramName}"!`);
      }

      done();
    });
  });

  // After all tests are finished drop database and close connection
  after(done => {
    mongoose.connection.close(done);
  });
});
