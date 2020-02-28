const mongoose = require("mongoose");
const async = require("async");
const fs = require("fs");
const moment = require("moment");
const config = require("../../config");

process.env.LOGGER_NAME = "scriptDBUsersDataImport";
process.env.LOGGER_LEVEL = "debug";
const logger = require("../logger_to_file");

const DbUser = require("../dbmodels/authUser");
const DbNode = require("../dbmodels/node");
const DbParam = require("../dbmodels/param");
const DbNodeParamLinkage = require("../dbmodels/nodeParamLinkage");
const DbNodeSchema = require("../dbmodels/nodeSchema");
const DbNodeCoordinates = require("../dbmodels/nodeCoordinates");

let warns = 0;
setWarn = text => {
  warns += 1;
  console.warn(`[!] ${text}`);
  logger.warn(`[!] ${text}`);
};

Start = cb => {
  logger.info("script started.");
  const start = moment();
  async.series(
    [
      openDBConnection,
      importUsers,
      importLinkages,
      importNodeSchemas,
      importNodeCoordinates,
      closeDBConnection
    ],
    err => {
      // console.info(arguments);
      if (err) {
        console.error(`Failed! ${err.message}`);
        logger.error(`Failed! ${err.message}`);
      } else if (warns === 0) {
        const duration = moment().diff(start);
        console.info(`done in ${moment(duration).format("mm:ss.SSS")}`);
        logger.info(`done in ${moment(duration).format("mm:ss.SSS")}`);
      } else {
        console.info(`done. warns ${warns}`);
        logger.info(`done. warns ${warns}`);
      }

      if (cb) cb(err);
    }
  );
};

openDBConnection = callback => {
  logger.info("open");

  // connect to the database and load dbmodels
  require("../dbmodels").connect(config.dbUri, false); // eslint-disable-line global-require

  mongoose.connection.on("open", callback);
};

closeDBConnection = callback => {
  mongoose.connection.close();
  callback();
};

getUser = (userEmail, callback) => {
  DbUser.findOne(
    {
      email: userEmail
    },
    (err, user) => {
      callback(err, user);
    }
  );
};

importUsers = callback => {
  let rawdata = null;
  const fileName = `${config.importPath}authUser.json`;

  if (!fs.existsSync(fileName)) {
    const err = Error(`file not exists: "${fileName}"`);
    console.info(err.message);
    logger.info(err.message);
    callback();
    return;
  }

  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    logger.error(`Read file error: ${err.message}`);
    callback(err);
    return;
  }

  let users;
  try {
    users = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create linkage Error: ${e.message}`);
    logger.error(`create linkage Error: ${e.message}`);
    callback(e);
    return;
  }

  async.eachLimit(
    users,
    100,
    (userRawData, callback) => {
      const newUser = new DbUser(userRawData);
      getUser(userRawData.email, (err, user) => {
        if (err) {
          callback(err);
        } else if (user) {
          if (
            userRawData.password !== user.password ||
            userRawData.name !== user.name ||
            userRawData.role !== user.role ||
            userRawData.might !== user.might ||
            userRawData.created !== user.created
          ) {
            DbUser.updateOne(
              { _id: user.id },
              {
                $set: {
                  password: user.password,
                  name: user.name,
                  role: user.role,
                  might: user.might,
                  created: user.created
                }
              },
              err => {
                if (err) {
                  callback(err);
                } else {
                  logger.info(`User "${user.email}"(${user.name}) updated`);
                  callback(null);
                }
              }
            );
          } else {
            callback(null);
          }
        } else {
          newUser.save(err => {
            if (err) {
              callback(`Exception on save User: ${err.message}`);
            } else {
              logger.info(
                `User "${newLinkage.nodeName}.${newLinkage.paramPropName}" inserted`
              );
              callback(null);
            }
          });
        }
      });
    },
    err => {
      if (err) {
        console.error(`Failed: ${err.message}`);
        logger.error(`Failed: ${err.message}`);
      } else {
        console.info(`Success: ${fileName}`);
        logger.info(`Success: ${fileName}`);
      }
      callback(err);
    }
  );
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
    console.info(err.message);
    logger.info(err.message);
    callback();
    return;
  }

  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    logger.error(`Read file error: ${err.message}`);
    callback(err);
    return;
  }

  let linkages;
  try {
    linkages = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create linkage Error: ${e.message}`);
    logger.error(`create linkage Error: ${e.message}`);
    callback(e);
    return;
  }

  async.eachLimit(
    linkages,
    100,
    (linkageRawData, callback) => {
      getNode(linkageRawData.nodeName, (err, node) => {
        if (err) {
          callback(err);
        } else if (node) {
          getParam(linkageRawData.paramPropValue, (err, param) => {
            if (err) {
              callback(err);
            } else if (param) {
              const newLinkage = new DbNodeParamLinkage(linkageRawData);
              DbNodeParamLinkage.findOne(
                {
                  nodeName: linkageRawData.nodeName,
                  paramPropName: linkageRawData.paramPropName
                },
                (err, linkage) => {
                  if (err) {
                    callback(err);
                  } else if (linkage) {
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
                        err => {
                          if (err) {
                            callback(err);
                          } else {
                            logger.info(
                              `Linkage "${linkage.nodeName}.${linkage.paramPropName}" updated`
                            );
                            callback(null);
                          }
                        }
                      );
                    } else {
                      callback(null);
                    }
                  } else {
                    newLinkage.save(err => {
                      if (err) {
                        callback(`Exception on save Linkage: ${err.message}`);
                      } else {
                        logger.info(
                          `Linkage "${newLinkage.nodeName}.${newLinkage.paramPropName}" inserted`
                        );
                        callback(null);
                      }
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
        logger.error(`Failed: ${err.message}`);
      } else {
        console.info(`Success: ${fileName}`);
        logger.info(`Success: ${fileName}`);
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
    console.info(err.message);
    logger.info(err.message);
    callback();
    return;
  }

  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    logger.error(`Read file error: ${err.message}`);
    callback(err);
    return;
  }

  let schemas;
  try {
    schemas = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create schema Error: ${e.message}`);
    logger.error(`create schema Error: ${e.message}`);
    callback(e);
    return;
  }

  async.eachLimit(
    schemas,
    100,
    (schemaRawData, callback) => {
      const newSchema = new DbNodeSchema(schemaRawData);
      DbNodeSchema.findOne(
        {
          name: schemaRawData.name
        },
        (err, schema) => {
          if (err) {
            callback(err);
          } else if (schema) {
            // null !== undefined but null == undefined
            if (
              schemaRawData.paramNames === null &&
              schema.paramNames === undefined
            ) {
              schemaRawData.paramNames = schema.paramNames;
            }

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
                err => {
                  if (err) {
                    callback(err);
                  } else {
                    logger.info(`Schema "${schema.name}" updated`);
                    callback();
                  }
                }
              );
            } else {
              callback(null);
            }
          } else {
            newSchema.save(err => {
              if (err) {
                callback(`Exception on save Schema: ${err.message}`);
              } else {
                logger.info(`Schema "${newSchema.name}" inserted`);
                callback(null);
              }
            });
          }
        }
      );
    },
    err => {
      if (err) {
        console.error(`Failed: ${err.message}`);
        logger.error(`Failed: ${err.message}`);
      } else {
        console.info(`Success: ${fileName}`);
        logger.info(`Success: ${fileName}`);
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
    console.info(err.message);
    logger.info(err.message);
    callback();
    return;
  }

  try {
    rawdata = fs.readFileSync(fileName);
  } catch (err) {
    console.error(`Read file error: ${err.message}`);
    logger.error(`Read file error: ${err.message}`);
    callback(err);
    return;
  }

  let coordinates;
  try {
    coordinates = JSON.parse(rawdata);
  } catch (e) {
    console.error(`create coordinates Error: ${e.message}`);
    logger.error(`create coordinates Error: ${e.message}`);
    callback(e);
    return;
  }

  async.eachLimit(
    coordinates,
    100,
    (coordinatesRawData, callback) => {
      getNode(coordinatesRawData.nodeName, (err, node) => {
        if (err) {
          callback(err);
        } else if (node) {
          getSchema(coordinatesRawData.schemaName, (err, schema) => {
            if (err) {
              callback(err);
            } else if (schema) {
              const newCoordinates = new DbNodeCoordinates(coordinatesRawData);
              DbNodeCoordinates.findOne(
                {
                  schemaName: coordinatesRawData.schemaName,
                  nodeName: coordinatesRawData.nodeName
                },
                (err, coordinates) => {
                  if (err) {
                    callback(err);
                  } else if (coordinates) {
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
                        err => {
                          if (err) {
                            callback(err);
                          } else {
                            logger.info(
                              `Coordinates "${coordinates.schemaName}.${coordinates.nodeName}" updated`
                            );
                            callback();
                          }
                        }
                      );
                    } else {
                      callback();
                    }
                  } else {
                    newCoordinates.save(err => {
                      if (err) {
                        callback(
                          `Exception on save Coordinate: ${err.message}`
                        );
                      } else {
                        logger.info(
                          `Coordinates "${coordinatesRawData.schemaName}.${coordinatesRawData.nodeName}" inserted`
                        );
                        callback();
                      }
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
        logger.error(`Failed: ${err.message}`);
      } else {
        console.info(`Success: ${fileName}`);
        logger.info(`Success: ${fileName}`);
      }
      callback(err);
    }
  );
};

module.exports.Start = Start;

Start();
