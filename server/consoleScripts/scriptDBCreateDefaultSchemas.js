const moment = require("moment");
const mongoose = require("mongoose");
const async = require("async");
const config = require("../../config");

process.env.LOGGER_NAME = "scriptDBCreateDefaultSchemas";
process.env.LOGGER_LEVEL = "debug";
const logger = require("../logger_to_file");

const DbNodeSchema = require("../dbmodels/nodeSchema");
const DbNodeCoordinates = require("../dbmodels/nodeCoordinates");

const myDataModelNodes = require("../models/myDataModelNodes");
const myDataModelSchemas = require("../models/myDataModelSchemas");

let inserted = 0;
let updated = 0;

Start = cb => {
  logger.info("script started.");

  const start = moment();

  async.series(
    [
      openDBConnection,
      loadDataModels,
      createRegionSchemas,
      createPSSchemas,
      loadDataModels, //if there are inserts or updates then datamodel should be reloaded.
      createDefaultCoordinatesForSchemaNodes,
      closeDBConnection
    ],
    err => {
      if (err) {
        console.info(`Failed! ${err.message}`);
        logger.info(`Failed! ${err.message}`);
      } else {
        const duration = moment().diff(start);
        console.info(`done in ${moment(duration).format("mm:ss.SSS")}`);
        logger.info(`done in ${moment(duration).format("mm:ss.SSS")}`);
      }

      if (cb) {
        cb(err);
      } else {
        // so that the logger could be done its work
        setTimeout(() => {
          process.exit(err ? 1 : 0);
        }, 1000);
      }
    }
  );
};

const openDBConnection = callback => {
  logger.info("open");
  // connect to the database and load dbmodels
  require("../dbmodels").connect(config.dbUri, false); // eslint-disable-line global-require

  mongoose.connection.on("open", callback);
};

const closeDBConnection = callback => {
  mongoose.connection.close();
  callback();
};

const loadDataModels = callback => {
  myDataModelNodes.LoadFromDB(err => {
    if (err) {
      callback(err);
    } else {
      myDataModelSchemas.LoadFromDB(err => {
        callback(err);
      });
    }
  });
};

const getDBSchema = (schemaName, callback) => {
  DbNodeSchema.findOne(
    {
      name: schemaName
    },
    (err, schema) => {
      callback(err, schema);
    }
  );
};

const insertOrUpdateDBSchema = (schema, callback) => {
  getDBSchema(schema.name, (err, dbSchema) => {
    if (err) {
      callback(err);
    } else if (dbSchema) {
      if (
        dbSchema.caption !== schema.caption ||
        dbSchema.description !== schema.description ||
        dbSchema.nodeNames !== schema.nodeNames ||
        !(dbSchema.paramNames == schema.paramNames) // null !== undefined but null == undefined
      ) {
        DbNodeSchema.updateOne(
          { _id: dbSchema.id },
          {
            $set: {
              caption: schema.caption,
              description: schema.description,
              nodeNames: schema.nodeNames,
              paramNames: schema.paramNames
            }
          },
          error => {
            if (error) {
              callback(err);
            } else {
              updated++;
              logger.info(`Schema "${schema.name}" updated`);
              callback();
            }
          }
        );
      } else {
        callback();
      }
    } else {
      if (schema.nodeNames == "") {
        logger.warn(`Ignored inserting of Schema "${schema.name}". No nodes.`);
        callback();
      } else {
        const newDbSchema = new DbNodeSchema(schema);
        newDbSchema.save(err => {
          if (err) {
            callback(`Exception on save Schema: ${err.message}`);
          } else {
            inserted++;
            logger.info(`Schema "${schema.name}" inserted`);
            callback();
          }
        });
      }
    }
  });
};

const createPSSchemas = callback => {
  inserted = 0;
  updated = 0;
  const locPSs = myDataModelNodes.GetAllPSsAsArray();

  async.each(
    locPSs,
    (ps, cb) => {
      const schema = myDataModelSchemas.CreatePSSchema(ps);
      insertOrUpdateDBSchema(schema, cb);
    },
    err => {
      if (err) {
        console.error(`createPSSchemas Failed: ${err.message}`);
        logger.error(`createPSSchemas Failed: ${err.message}`);
      } else {
        console.info(
          `createPSSchemas Successed: inserted: ${inserted} updated: ${updated}`
        );
        logger.info(
          `createPSSchemas Successed: inserted: ${inserted} updated: ${updated}`
        );
      }
      callback(err);
    }
  );
};

const createRegionSchemas = callback => {
  inserted = 0;
  updated = 0;
  const schemas = myDataModelSchemas.CreateNodeSchemasForRegions();

  async.each(
    schemas,
    (schema, cb) => {
      insertOrUpdateDBSchema(schema, cb);
    },
    err => {
      if (err) {
        console.error(`createRegionSchemas Failed: ${err.message}`);
        logger.error(`createRegionSchemas Failed: ${err.message}`);
      } else {
        console.info(
          `createRegionSchemas Successed: inserted: ${inserted} updated: ${updated}`
        );
        logger.info(
          `createRegionSchemas Successed: inserted: ${inserted} updated: ${updated}`
        );
      }
      callback(err);
    }
  );
};

getDBSchemaCoordinates = (schemaName, callback) => {
  DbNodeCoordinates.find(
    {
      schemaName: schemaName
    },
    (err, coordinates) => {
      callback(err, coordinates);
    }
  );
};

insertOrUpdateDBCoordinates = (schema, callback) => {
  let nodeNames = [];
  if (schema.nodeNames) {
    nodeNames = schema.nodeNames.split(",");
  }

  const defaultCoordinates = myDataModelSchemas.GetSchemaDefaultCoordinates(
    schema.name
  );
  if (defaultCoordinates.length === 0) {
    callback(
      Error(`Cannot create default coordinates for 
    schema with name "${schema.name}".`)
    );
    return;
  }

  if (nodeNames.length === 0) {
    callback();
    return;
  }

  getDBSchemaCoordinates(schema.name, (err, coordinates) => {
    if (err) {
      callback(err);
    } else {
      async.each(
        nodeNames,
        (nodeName, cb) => {
          const newCoordinate = defaultCoordinates.find(
            coordinate => coordinate.nodeName === nodeName
          );

          if (!newCoordinate) {
            cb(
              Error(
                `There is no default coordinates for "${schema.name}.${nodeName}"!`
              )
            );
            return;
          }

          const dbCoordinate = coordinates.find(
            coordinate => coordinate.nodeName === nodeName
          );

          if (dbCoordinate) {
            if (
              dbCoordinate.x !== newCoordinate.x ||
              dbCoordinate.y !== newCoordinate.y
            ) {
              DbNodeCoordinates.updateOne(
                { _id: dbCoordinate.id },
                {
                  $set: {
                    x: newCoordinate.x,
                    y: newCoordinate.y
                  }
                },
                error => {
                  if (error) {
                    cb(err);
                  } else {
                    updated++;
                    logger.info(
                      `Coordinate "${schema.name}.${nodeName}" updated`
                    );
                    cb();
                  }
                }
              );
            } else {
              cb();
            }
          } else {
            const newDbCoordinate = new DbNodeCoordinates(newCoordinate);
            newDbCoordinate.save(err => {
              if (err) {
                cb(`Exception on save Coordinate: ${err.message}`);
              } else {
                inserted++;
                logger.info(`Coordinate "${schema.name}.${nodeName}" inserted`);
                cb();
              }
            });
          }
        },
        err => {
          if (err) {
            console.error(
              `insertOrUpdateDBCoordinates for "${schema.name}" Failed: ${err.message}`
            );
            logger.error(
              `insertOrUpdateDBCoordinates for "${schema.name}" Failed: ${err.message}`
            );
          } else {
            console.info(
              `insertOrUpdateDBCoordinates for "${schema.name}" Successed: inserted: ${inserted} updated: ${updated}`
            );
            logger.info(
              `insertOrUpdateDBCoordinates for "${schema.name}" Successed: inserted: ${inserted} updated: ${updated}`
            );
          }
          callback(err);
        }
      );
    }
  });
};

const createDefaultCoordinatesForSchemaNodes = callback => {
  inserted = 0;
  updated = 0;
  // DbNodeCoordinates.find({ "schemaName": { "$regex": "^nodes_of_|^schema_of_" } })
  DbNodeSchema.find(
    { name: new RegExp("^nodes_of_|^schema_of_", "i") },
    (err, schemas) => {
      if (err) {
        callback(err);
      } else {
        async.each(
          schemas,
          (schema, cb) => {
            if (schema.nodeNames) {
              insertOrUpdateDBCoordinates(schema, cb);
            } else {
              cb();
            }
          },
          err => {
            if (err) {
              console.error(
                `createDefaultCoordinatesForSchemaNodes Failed: ${err.message}`
              );
              logger.error(
                `createDefaultCoordinatesForSchemaNodes Failed: ${err.message}`
              );
            } else {
              console.info(
                `createDefaultCoordinatesForSchemaNodes Successed: inserted: ${inserted} updated: ${updated}`
              );
              logger.info(
                `createDefaultCoordinatesForSchemaNodes Successed: inserted: ${inserted} updated: ${updated}`
              );
            }
            callback(err);
          }
        );
      }
    }
  );
};

Start();
