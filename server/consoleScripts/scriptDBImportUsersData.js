const mongoose = require("mongoose");
const fs = require("fs");
const moment = require("moment");
const DbNode = require("../dbmodels/node");
const DbParam = require("../dbmodels/param");
const DbNodeParamLinkage = require("../dbmodels/nodeParamLinkage");
const DbNodeSchema = require("../dbmodels/nodeSchema");
const DbNodeCoordinates = require("../dbmodels/nodeCoordinates");

const async = require("async");
const config = require("../../config");

let warns = 0;
setWarn = text => {
  warns += 1;
  console.warn(`[!] ${text}`);
};

Start = cb => {
  const start = moment();
  async.series(
    [
      openDBConnection,
      importLinkages,
      importNodeSchemas,
      importNodeCoordinates,
      closeDBConnection
    ],
    err => {
      // console.info(arguments);
      if (err) {
        console.error(`Failed! ${err.message}`);
      } else if (warns === 0) {
        const duration = moment().diff(start);
        console.info(`done in ${moment(duration).format("mm:ss.SSS")}`);
      } else {
        console.info(`done. warns ${warns}`);
      }

      if (cb) cb(err);
    }
  );
};

openDBConnection = callback => {
  console.info("open");
  // connect to the database and load dbmodels
  require("../dbmodels").connect(config.dbUri, false); // eslint-disable-line global-require

  mongoose.connection.on("open", callback);
};

closeDBConnection = callback => {
  mongoose.connection.close();
  callback();
};

getNode = (nodeName, callback) => {
  DbNode.findOne(
    {
      name: nodeName
    },
    (err, node) => {
      callback(err, node);
    }
  );
};

getParam = (paramName, callback) => {
  DbParam.findOne(
    {
      name: paramName
    },
    (err, param) => {
      callback(err, param);
    }
  );
};

getSchema = (schemaName, callback) => {
  DbNodeSchema.findOne(
    {
      name: schemaName
    },
    (err, schema) => {
      callback(err, schema);
    }
  );
};

importLinkages = callback => {
  let rawdata = null;
  const fileName = `${config.importPath}nodeParamLinkage.json`;

  if (!fs.existsSync(fileName)) {
    const err = Error(`file not exists: "${fileName}"`);
    console.log(err.message);
    callback();
    return;
  }

  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    callback(err);
    return;
  }

  let linkages;
  try {
    linkages = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create linkage Error: ${e.message}`);
    callback(e);
    return;
  }

  async.each(
    linkages,
    (linkageRawData, callback) => {
      getNode(linkageRawData.nodeName, (err, node) => {
        if (err) callback(err);
        if (node) {
          getParam(linkageRawData.paramPropValue, (err, param) => {
            if (err) callback(err);
            if (param) {
              const newLinkage = new DbNodeParamLinkage(linkageRawData);
              DbNodeParamLinkage.findOne(
                {
                  nodeName: linkageRawData.nodeName,
                  paramPropName: linkageRawData.paramPropName
                },
                (err, linkage) => {
                  if (err) callback(err);
                  if (linkage) {
                    if (
                      linkageRawData.paramPropValue !== linkage.paramPropValue
                    ) {
                      DbNodeParamLinkage.updateOne(
                        { _id: linkage.id },
                        {
                          $set: {
                            paramPropValue: linkageRawData.paramPropValue
                          }
                        },
                        error => {
                          if (error) throw callback(error);
                          console.info(
                            `Linkage "${linkage.nodeName}.${linkage.paramPropName}" updated`
                          );
                          callback(null);
                        }
                      );
                    } else {
                      callback(null);
                    }
                  } else {
                    newLinkage.save(err => {
                      if (err) callback(err);
                      console.info(
                        `Linkage "${newLinkage.nodeName}.${newLinkage.paramPropName}" inserted`
                      );
                      callback(null);
                    });
                  }
                }
              );
            } else {
              setWarn(
                `Unknown param "${linkageRawData.paramPropValue}" on importing linkages`
              );
              callback(null);
            }
          });
        } else {
          setWarn(
            `Unknown node "${linkageRawData.nodeName}" on importing linkages`
          );
          callback(null);
        }
      });
    },
    err => {
      if (err) {
        console.error(`Failed: ${err.message}`);
      } else {
        console.info(`Success: ${fileName}`);
      }
      callback(err);
    }
  );
};

importNodeSchemas = callback => {
  let rawdata = null;
  const fileName = `${config.importPath}nodeSchemas.json`;

  if (!fs.existsSync(fileName)) {
    const err = Error(`file not exists: "${fileName}"`);
    console.log(err.message);
    callback();
    return;
  }

  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    callback(err);
    return;
  }

  let schemas;
  try {
    schemas = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create schema Error: ${e.message}`);
    callback(e);
    return;
  }

  async.each(
    schemas,
    (schemaRawData, callback) => {
      const newSchema = new DbNodeSchema(schemaRawData);
      DbNodeSchema.findOne(
        {
          name: schemaRawData.name
        },
        (err, schema) => {
          if (err) callback(err);
          if (schema) {
            if (
              schemaRawData.caption !== schema.caption ||
              schemaRawData.description !== schema.description ||
              schemaRawData.nodeNames !== schema.nodeNames ||
              schemaRawData.paramNames !== schema.paramNames
            ) {
              DbNodeParamLinkage.updateOne(
                { _id: schema.id },
                {
                  $set: {
                    caption: schemaRawData.caption,
                    description: schemaRawData.description,
                    nodeNames: schemaRawData.nodeNames,
                    paramNames: schemaRawData.paramNames
                  }
                },
                error => {
                  if (error) throw callback(error);
                  console.info(`Schema "${schema.name}" updated`);
                  callback(null);
                }
              );
            } else {
              callback(null);
            }
          } else {
            newSchema.save(err => {
              if (err) callback(err);
              console.info(`Schema "${newSchema.name}" inserted`);
              callback(null);
            });
          }
        }
      );
    },
    err => {
      if (err) {
        console.error(`Failed: ${err.message}`);
      } else {
        console.info(`Success: ${fileName}`);
      }
      callback(err);
    }
  );
};

importNodeCoordinates = callback => {
  let rawdata = null;
  const fileName = `${config.importPath}nodeCoordinates.json`;

  if (!fs.existsSync(fileName)) {
    const err = Error(`file not exists: "${fileName}"`);
    console.log(err.message);
    callback();
    return;
  }

  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    callback(err);
    return;
  }

  let coordinates;
  try {
    coordinates = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create coordinates Error: ${e.message}`);
    callback(e);
    return;
  }

  async.each(
    coordinates,
    (coordinatesRawData, callback) => {
      getNode(coordinatesRawData.nodeName, (err, node) => {
        if (err) callback(err);
        if (node) {
          getSchema(coordinatesRawData.schemaName, (err, schema) => {
            if (err) callback(err);
            if (!schema) {
              if (coordinatesRawData.schemaName.startsWith("nodes_of_")) {
                //res

                //check if res exists

              } else {
                //ps

                // check if ps exists

              }
            }

            if (schema) {
              const newCoordinates = new DbNodeCoordinates(coordinatesRawData);
              DbNodeCoordinates.findOne(
                {
                  schemaName: coordinatesRawData.schemaName,
                  nodeName: coordinatesRawData.nodeName
                },
                (err, coordinates) => {
                  if (err) callback(err);
                  if (coordinates) {
                    if (
                      coordinatesRawData.x !== coordinates.x ||
                      coordinatesRawData.y !== coordinates.y
                    ) {
                      DbNodeCoordinates.updateOne(
                        { _id: coordinates.id },
                        {
                          $set: {
                            x: coordinatesRawData.x,
                            y: coordinatesRawData.y
                          }
                        },
                        error => {
                          if (error) throw callback(error);
                          console.info(
                            `Coordinates "${coordinates.schemaName}.${coordinates.nodeName}" updated`
                          );
                          callback(null);
                        }
                      );
                    } else {
                      callback(null);
                    }
                  } else {
                    newCoordinates.save(err => {
                      if (err) callback(err);
                      console.info(
                        `Coordinates "${coordinates.schemaName}.${coordinates.nodeName}" inserted`
                      );
                      callback(null);
                    });
                  }
                }
              );
            } else {
              setWarn(
                `Unknown schema "${coordinatesRawData.schemaName}" on importing coordinates`
              );
              callback(null);
            }
          });
        } else {
          setWarn(
            `Unknown node "${coordinatesRawData.nodeName}" on importing coordinates`
          );
          callback(null);
        }
      });
    },
    err => {
      if (err) {
        console.error(`Failed: ${err.message}`);
      } else {
        console.info(`Success: ${fileName}`);
      }
      callback(err);
    }
  );
};

module.exports.Start = Start;

Start();
