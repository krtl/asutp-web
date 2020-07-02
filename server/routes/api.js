const express = require("express");
const async = require("async");
const moment = require("moment");
const logger = require("../logger");
const userActions = require("../passport/userActions");

const DbParam = require("../dbmodels/param");
const DbParamValues = require("../dbmodels/paramValue");
const DbBlockedParams = require("../dbmodels/blockedParam");
const DbParamHalfHourValues = require("../dbmodels/paramHalfHourValue");
const DbNodePoweredStateValue = require("../dbmodels/nodePoweredStateValue");
const DbNodeSwitchedOnStateValue = require("../dbmodels/nodeSwitchedOnStateValue");
const DbNodeCoordinates = require("../dbmodels/nodeCoordinates");
const DbNodeSchema = require("../dbmodels/nodeSchema");
const DbAsutpConnection = require("../dbmodels/asutpConnection");
const DbNodeParamLinkage = require("../dbmodels/nodeParamLinkage");
const DbUserAction = require("../dbmodels/authUserAction");

const myDataModelNodes = require("../models/myDataModelNodes");
const myDataModelSchemas = require("../models/myDataModelSchemas");
const MyServerStatus = require("../serviceServer/serverStatus");

// const myDataModelNodes = require('../models/myDataModelNodes');
const commandsServer = require("../serviceServer/commandsServer");
const lastParamValues = require("../serviceServer/lastParamValues");

const router = new express.Router();

router.get("/dashboard", (req, res) => {
  res.status(200).json({
    message: "You're authorized to see this secret message."
  });
});

router.get("/schemas", (req, res, next) => {
  // currently not used
  DbNodeSchema.find({}, (err, schemas) => {
    if (err) return next(err);
    res.status(200).json(schemas);
    return 0;
  });
});

router.get("/params", (req, res, next) => {
  const schemaName = req.query.schemaName;

  if (!schemaName || schemaName === "") {
    res.json({
      error: "Missing required parameter `schemaName`!"
    });
    return;
  }

  DbNodeSchema.findOne(
    {
      name: schemaName
    },
    (err, prmList) => {
      if (err) return next(err);

      if (prmList && prmList.paramNames) {
        const locParams = prmList.paramNames.split(",");
        DbParam.find(
          {
            name: { $in: locParams }
          },
          (err, params) => {
            if (err) return next(err);
            res.status(200).json(params);
            return 0;
          }
        );
      } else {
        res.status(200).json([]);
      }
      return 0;
    }
  );
});

router.get("/paramValues", (req, res, next) => {
  const paramName = req.query.paramName;
  const momentFromDT = moment(req.query.fromDT);
  const momentToDT = moment(req.query.toDT);
  const fromDT = new Date(momentFromDT);
  const toDT = new Date(momentToDT);

  if (!paramName || paramName === "") {
    res.json({
      error: "Missing required parameter `paramName`!"
    });
    return;
  }

  const param = myDataModelNodes.GetParam(paramName);
  if (param) {
    let model;
    if (param.trackAllChanges) {
      model = DbParamValues;
    } else if (param.trackAveragePerHour) {
      model = DbParamHalfHourValues;
    }
    if (model) {
      model
        .find({ paramName, dt: { $gte: fromDT, $lt: toDT } })
        .sort({ dt: 1 })
        .select({
          paramName: 1,
          value: 1,
          dt: 1,
          qd: 1,
          _id: 0
        })
        .limit(500)
        .exec((err, paramValues) => {
          if (err) return next(err);
          res.status(200).json(paramValues);
          return 0;
        });
    } else {
      res.status(200).json([]);
      return 0;
    }
  } else {
    res.json({
      error: `Param with name="${paramName}" is not found!`
    });
    return;
  }
});

router.get("/nodePoweredStateValues", (req, res, next) => {
  const nodeName = req.query.nodeName;
  const momentFromDT = moment(req.query.fromDT);
  const momentToDT = moment(req.query.toDT);
  const fromDT = new Date(momentFromDT);
  const toDT = new Date(momentToDT);

  if (!nodeName || nodeName === "") {
    res.json({
      error: "Missing required parameter `nodeName`!"
    });
    return;
  }

  DbNodePoweredStateValue.find({ nodeName, dt: { $gte: fromDT, $lt: toDT } })
    .populate("user", "_id name email")
    .select("nodeName oldState newState dt user -_id")
    // .select({ nodeName: 1, oldState: 1, newState: 1, dt: 1, _id: 0 })
    .sort({ dt: "desc" })
    .limit(500)
    .exec((err, nodeStateValues) => {
      if (err) return next(err);
      res.status(200).json(nodeStateValues);
      return 0;
    });
});

router.get("/nodeSwitchedOnStateValues", (req, res, next) => {
  const connectorName = req.query.connectorName;
  const momentFromDT = moment(req.query.fromDT);
  const momentToDT = moment(req.query.toDT);
  const fromDT = new Date(momentFromDT);
  const toDT = new Date(momentToDT);

  if (!connectorName || connectorName === "") {
    res.json({
      error: "Missing required parameter `connectorName`!"
    });
    return;
  }

  DbNodeSwitchedOnStateValue.find({
    connectorName: connectorName,
    dt: { $gte: fromDT, $lt: toDT }
  })
    .populate("user", "_id name email")
    .select("connectorName oldState newState dt user -_id")
    // .select({ connectorName: 1, oldState: 1, newState: 1, dt: 1, _id: 0 })
    .sort({ dt: "desc" })
    .limit(500)
    .exec((err, nodeStateValues) => {
      if (err) return next(err);
      res.status(200).json(nodeStateValues);
      return 0;
    });
});

// obsolete
router.get("/getNodeCoordinates", (req, res, next) => {
  const schemaName = req.query.schemaName;

  if (!schemaName || schemaName === "") {
    res.json({
      error: "Missing required parameter `schemaName`!"
    });
    return;
  }

  DbNodeCoordinates.find({ schemaName })
    .select({ nodeName: 1, x: 1, y: 1, _id: 0 })
    .limit(10000)
    .exec((err, schemaNodes) => {
      if (err) return next(err);
      res.status(200).json(schemaNodes);
      return 0;
    });
});

router.post("/resetNodeCoordinates", (req, res, next) => {
  const schemaName = req.query.schemaName;

  if (!schemaName || schemaName === "") {
    res.json({
      error: "Missing required parameter `schemaName`!"
    });
    return;
  }

  DbNodeCoordinates.deleteMany({ schemaName }, (err, result) => {
    if (err) {
      logger.warn(`[!] ${err.message}`);
      next(err);
    } else {
      const s = `${result.deletedCount} nodes were deleted from DbNodeCoordinates.`;
      logger.debug(s);

      userActions.LogUserAction(
        req.user,
        userActions.ResetNodeCoordinates,
        `Schema=${schemaName}, Result=${s}`,
        req
      );
      res.status(200).json({
        message: s
      });
    }
  });
});

router.post("/saveNodeCoordinates", (req, res, next) => {
  const schemaName = req.query.schemaName;

  let updated = 0;
  let inserted = 0;

  if (!schemaName || schemaName === "") {
    res.json({
      error: "Missing required parameter `schemaName`!"
    });
    return;
  }

  const nodes = req.body;

  async.eachLimit(
    nodes,
    100,
    (locNode, callback) => {
      DbNodeCoordinates.findOne(
        {
          schemaName,
          nodeName: locNode.nodeName
        },
        (err, netNode) => {
          if (err) {
            logger.info(`[saveNodeCoordinates] findOne error: ${err.message}`);
            return callback(err);
          }

          if (netNode) {
            if (locNode.x !== netNode.x || locNode.y !== netNode.y) {
              DbNodeCoordinates.updateOne(
                { _id: netNode.id },
                {
                  $set: {
                    x: locNode.x,
                    y: locNode.y
                  }
                },
                err => {
                  if (err) return callback(err);

                  logger.debug(
                    `[saveNodeCoordinates] updated node "${netNode.nodeName}" in "${schemaName}"`
                  );
                  updated++;

                  return callback(null);
                }
              );
            } else {
              return callback(null);
            }
          } else {
            const newNodeCoordinates = new DbNodeCoordinates(locNode);
            newNodeCoordinates.nodeName = locNode.nodeName;
            newNodeCoordinates.schemaName = schemaName;
            newNodeCoordinates.save(err => {
              if (err) {
                logger.warn(
                  `[saveNodeCoordinates] newNetNodeShema.save error: ${err.message}`
                );
                return callback(err);
              }
              logger.debug(
                `[saveNodeCoordinates] node "${locNode.nodeName}" inserted into "${schemaName}"`
              );
              inserted++;

              return callback(null);
            });
          }
          return null;
        }
      );
    },
    err => {
      if (err) {
        logger.info(`[saveNodeCoordinates] Failed: ${err.message}`);
        // next(err);
        res.status(500).json({
          message: err.message
        });
      } else {
        logger.debug("[saveNodeCoordinates] All saved successfully");
        res.status(200).json({
          message: "'All saved successfully'"
        });
        userActions.LogUserAction(
          req.user,
          userActions.SaveNodeCoordinates,
          `Schema=${schemaName}, Updated=${updated}, Inserted=${inserted}`,
          req
        );
      }
    }
  );
});

router.post("/saveParamManualValue", (req, res, next) => {
  const manualvalue = req.body;
  manualvalue.user = req.user._id;
  const err = commandsServer.SetManualValue(manualvalue);

  if (err) {
    logger.info(`[saveParamManualValue] Failed: ${err.message}`);
    // next(err);
    res.status(500).json({
      message: err.message
    });
  } else {
    logger.debug(`[saveParamManualValue] Manual value saved. Param = ${manualvalue.paramName}, Value = ${manualvalue.manualValue}, cmd = ${manualvalue.cmd}, User = ${req.user.name}(${req.user.email})`);

    userActions.LogUserAction(
      req.user,
      userActions.SaveParamManualValue,
      `Param = ${manualvalue.paramName}, Value = ${manualvalue.manualValue}, cmd = ${manualvalue.cmd}`,
      req
    );

    res.status(200).json({
      message: "'Manual value saved'"
    });
  }
});

router.post("/saveConnectionManualValue", (req, res, next) => {
  const manualvalue = req.body;
  manualvalue.user = req.user._id;
  const err = commandsServer.SetManualValue(manualvalue);

  if (err) {
    logger.info(`[saveConnectionManualValue] Failed: ${err.message}`);
    // next(err);
    res.status(500).json({
      message: err.message
    });
  } else {
    logger.debug(`[saveConnectionManualValue] Connection Manual value saved. Param = ${manualvalue.nodeName}, Value = ${manualvalue.manualValue}, cmd = ${manualvalue.cmd}, User = ${req.user.name}(${req.user.email})`);

    userActions.LogUserAction(
      req.user,
      userActions.SaveConnectionManualValue,
      `Node = ${manualvalue.nodeName}, Value = ${manualvalue.manualValue}, cmd = ${manualvalue.cmd}`,
      req
    );

    res.status(200).json({
      message: "Manual value saved"
    });
  }
});

router.post("/addNewCustomSchema", (req, res, next) => {
  const schemaInfo = req.body;
  const dbSchema = DbNodeSchema(schemaInfo);
  dbSchema.save(err => {
    if (err) {
      logger.info(`[addNewCustomSchema] Failed: ${err.message}`);
      // next(err);
      res.status(500).json({
        message: err.message
      });
    } else {
      console.log(`Schema "${dbSchema.name}" inserted`);
      myDataModelSchemas.ReloadCustomSchema(dbSchema.name, err => {
        if (err) {
          logger.info(`[ReloadCustomSchema] Failed: ${err.message}`);
          // next(err);
          res.status(500).json({
            message: err.message
          });
        }
        logger.debug(
          `[addNewCustomSchema] New custom schema ${schemaInfo} has added`
        );

        userActions.LogUserAction(
          req.user,
          userActions.AddNewCustomSchema,
          `Name = ${schemaInfo.name}`,
          req
        );

        res.status(200).json({
          message: "New custom schema added"
        });
      });
    }
  });
});

router.post("/deleteCustomSchema", (req, res, next) => {
  const schemaName = req.query.schemaName;

  myDataModelSchemas.DeleteCustomSchema(schemaName, err => {
    if (err) {
      logger.info(`[DeleteCustomSchema] Failed: ${err.message}`);
      // next(err);
      res.status(500).json({
        message: err.message
      });
    }

    logger.debug(
      `[deleteCustomSchema] custom schema ${schemaName} has deleted`
    );

    userActions.LogUserAction(
      req.user,
      userActions.DeleteCustomSchema,
      `Schema = ${schemaName}`,
      req
    );

    res.status(200).json({
      message: "Custom schema deleted"
    });
  });
});

router.post("/customSchemaAddNode", (req, res, next) => {
  const requestInfo = req.body;
  myDataModelSchemas.CustomSchemaAddNode(
    requestInfo.schemaName,
    requestInfo.nodeName,
    err => {
      if (err) {
        logger.info(`[CustomSchemaAddNode] Failed: ${err.message}`);
        // next(err);
        res.status(500).json({
          message: err.message
        });
      } else {
        logger.debug(
          `[CustomSchemaAddNode] node ${requestInfo.nodeName} has added to custom schema ${requestInfo.schemaName}`
        );

        userActions.LogUserAction(
          req.user,
          userActions.CustomSchemaNodeAdded,
          `Schema = ${requestInfo.schemaName}, Node = ${requestInfo.nodeName}`,
          req
        );

        res.status(200).json({
          message: "Custom schema edited"
        });
      }
    }
  );
});

router.post("/customSchemaDeleteNode", (req, res, next) => {
  const requestInfo = req.body;
  myDataModelSchemas.CustomSchemaDeleteNode(
    requestInfo.schemaName,
    requestInfo.nodeName,
    err => {
      if (err) {
        logger.info(`[CustomSchemaDeleteNode] Failed: ${err.message}`);
        next(err);
        // res.status(500).json({
        //   message: err.message
        // });
      } else {
        logger.debug(
          `[CustomSchemaDeleteNode] node ${requestInfo.nodeName} has deleted from custom schema ${requestInfo.schemaName}`
        );

        res.status(200).json({
          message: "Custom schema edited"
        });

        userActions.LogUserAction(
          req.user,
          userActions.CustomSchemaNodeDeleted,
          `Schema = ${requestInfo.schemaName}, Node = ${requestInfo.nodeName}`,
          req
        );
      }
    }
  );
});

router.get("/getCollisions", (req, res, next) => {
  // currently callback from backgroundworker is not implemented, so to receive actual collisions you need to tap several time

  const err = commandsServer.GetCollisions();
  if (err) {
    logger.info(`[GetCollisions] Failed: ${err.message}`);
    // next(err);
    res.status(500).json({
      message: err.message
    });
  } else {
    res.status(200).json(MyServerStatus.getCollisions());
    return 0;
  }
});

router.get("/getBlockedParams", (req, res, next) => {
  DbBlockedParams.find({})
    .populate("user", "_id name email")
    .select("name dt user -_id")
    .sort({ dt: "desc" })
    .limit(1000)
    .exec((err, data) => {
      if (err) {
        logger.info(`[CustomSchemaDeleteNode] Failed: ${err.message}`);
        next(err);
        // res.status(500).json({
        //   message: err.message
        // });
      } else {
        res.status(200).json(data);
        return 0;
      }
    });
});

router.get("/getAsutpConnections", (req, res, next) => {
  DbAsutpConnection.find({})
    .sort({ psSapCode: 1, voltage: -1 })
    .select({
      name: 1,
      caption: 1,
      psSapCode: 1,
      voltage: 1,
      connectionNumber: 1,
      VVParamName: 1,
      PParamName: 1,
      UlParamName: 1,
      _id: 0
    })
    .limit(5000)
    .exec((err, asutpConnections) => {
      if (err) return next(err);

      let resultPSs = new Map();
      let key = 0;

      const locPSs = myDataModelNodes.GetAllPSsAsArray();

      for (let i = 0; i < asutpConnections.length; i += 1) {
        const asutpConnection = asutpConnections[i];
        const resultConnection = {
          key: key++,
          name: asutpConnection.name,
          caption: asutpConnection.caption,
          voltage: asutpConnection.voltage,
          connectionNumber: asutpConnection.connectionNumber,
          params: []
        };
        for (let j = 0; j < locPSs.length; j += 1) {
          const ps = locPSs[j];
          if (ps.sapCode === asutpConnection.psSapCode) {
            let resultPS;
            if (resultPSs.has(asutpConnection.psSapCode)) {
              resultPS = resultPSs.get(asutpConnection.psSapCode);
            } else {
              resultPS = {
                key: key++,
                name: ps.name,
                caption: ps.caption,
                sapCode: ps.sapCode,
                connections: []
              };
              resultPSs.set(asutpConnection.psSapCode, resultPS);
            }
            resultPS.connections.push(resultConnection);

            const paramPropNames = ["VVParamName", "PParamName", "UlParamName"];

            for (let k = 0; k < paramPropNames.length; k += 1) {
              const paramPropName = paramPropNames[k];
              if (paramPropName in asutpConnection) {
                const locParam = myDataModelNodes.GetParam(
                  asutpConnection[paramPropName]
                );
                if (locParam) {
                  const resultParam = {
                    key: key++,
                    name: locParam.name,
                    caption: locParam.caption,
                    value: ""
                  };
                  resultConnection.params.push(resultParam);

                  const paramValue = lastParamValues.getLastValue(
                    locParam.name
                  );
                  if (paramValue) {
                    resultParam.value = paramValue.value;
                  }
                }
              }
            }

            break;
          }
        }
      }

      const result = Array.from(resultPSs.values());

      res.status(200).json(result);
      return 0;
    });
});

router.post("/savePSLinkage", (req, res, next) => {
  const psName = req.query.name;

  const linkages = req.body;

  async.eachLimit(
    linkages,
    100,
    (locLinkage, callback) => {
      DbNodeParamLinkage.findOne(
        {
          nodeName: locLinkage.nodeName,
          paramPropName: locLinkage.paramPropName
        },
        (err, linkage) => {
          if (err) {
            logger.warn(
              `[savePSLinkage] Something wrong when DbNodeParamLinkage findOne for "${psName}"!`
            );
            return callback(err);
          }

          if (linkage) {
            if (locLinkage.paramPropValue !== linkage.paramPropValue) {
              DbNodeParamLinkage.updateOne(
                { _id: linkage.id },
                {
                  $set: {
                    // caption: locNode.caption,
                    // description: locNode.description,
                    paramPropValue: locLinkage.paramPropValue
                  }
                },
                err => {
                  if (err) {
                    logger.warn(
                      `[savePSLinkage] Something wrong when DbNodeParamLinkage update for "${psName}"!`
                    );
                    return callback(err);
                  }

                  logger.debug(
                    `[savePSLinkage] updated nodeLinkage "${linkage.nodeName}.${linkage.paramPropName}"`
                  );

                  return callback(null);
                }
              );
            } else {
              return callback(null);
            }
          } else {
            const newNodeParamLinkage = new DbNodeParamLinkage(locLinkage);

            newNodeParamLinkage.save(err => {
              if (err) {
                logger.warn(
                  `[savePSLinkage] Something wrong when DbNodeParamLinkage save  for "${psName}"!`
                );
                return callback(err);
              }
              logger.debug(
                `[savePSLinkage] nodeLinkage "${locLinkage.nodeName}.${locLinkage.paramPropName}" inserted`
              );

              return callback(null);
            });
          }
          return 0;
        }
      );
    },
    err => {
      if (err) {
        logger.info(`Failed: ${err.message} `);
        next(err);
        // res.status(500).json({
        //   message: err.message,
        // });
      } else {
        logger.info(
          `[savePSLinkage] All nodeLinkages are saved successfully for "${psName}"`
        );

        myDataModelNodes.RelinkParamNamesToNodes(err => {
          if (err) {
            logger.warn(
              `[savePSLinkage] Something wrong on RelinkParamsToNodes for "${psName}"! ${err.message}`
            );
            next(err);
          } else {
            logger.info(
              `[savePSLinkage] Nodes are successfully relinked to Params for "${psName}"`
            );

            myDataModelSchemas.ReloadPSSchemaParams(psName, err => {
              if (err) {
                logger.warn(
                  `[savePSLinkage] Something wrong on ReloadPSSchemaParams for "${psName}"! ${err.message}`
                );

                next(err);
              } else {
                logger.info(
                  `[savePSLinkage] PSSchema params "${psName}" successfully reloaded.`
                );

                const changedNodes = [];
                linkages.forEach(element => {
                  changedNodes.push(element.nodeName);
                });

                userActions.LogUserAction(
                  req.user,
                  userActions.SavePSLinkage,
                  `PS = ${psName}, Linkages = ${changedNodes.join()} `,
                  req
                );

                res.status(200).json({
                  message: `All nodeLinkages are saved successfully for "${psName}"`
                });
              }
            });
          }
        });
      }
    }
  );
});

router.get("/getUserActions", (req, res, next) => {
  const userId = req.query.userId;
  const action = req.query.action;
  const momentFromDT = moment(req.query.fromDT);
  const momentToDT = moment(req.query.toDT);
  const fromDT = new Date(momentFromDT);
  const toDT = new Date(momentToDT);

  const findObj = {
    dt: { $gte: fromDT, $lt: toDT }
  };

  if (userId && userId !== "") {
    findObj.user = userId;
  }
  if (action && action !== "") {
    findObj.action = action;
  }

  DbUserAction.find(findObj)
    .populate("user", "_id name email")
    .select("_id dt user action params host")
    .sort({ dt: -1 })
    .limit(500)
    .exec((err, nodeStateValues) => {
      if (err) return next(err);
      res.status(200).json(nodeStateValues);
      return 0;
    });
});

module.exports = router;
