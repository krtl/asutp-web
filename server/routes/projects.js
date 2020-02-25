const async = require("async");
const logger = require("../logger");
const myDataModelNodes = require("../models/myDataModelNodes");
const myDataModelSchemas = require("../models/myDataModelSchemas");
const DbAsutpConnection = require("../dbmodels/asutpConnection");
const DbNodeParamLinkage = require("../dbmodels/nodeParamLinkage");

module.exports = app => {
  app.get("/allParamsAsArray", (req, res) => {
    const params = myDataModelNodes.GetAllParamsAsArray();
    res.json(params);
    return true;
  });

  app.get("/getSchemas", (req, res) => {
    const names = [];
    const schemas = myDataModelSchemas.GetCustomAndRegionSchemas();
    schemas.forEach(nodeSchema => {
      const obj = {
        name: nodeSchema.name,
        caption: nodeSchema.caption,
        sapCode: nodeSchema.sapCode
      };
      names.push(obj);
    });
    res.json(names);
    return true;
  });

  app.get("/getRegionsNodesForSchemaEdit", (req, res) => {
    const regions = [];

    const locPSs = myDataModelNodes.GetAllPSsAsArray();
    const locRegions = myDataModelNodes.GetAllRegionsAsArray();

    for (let i = 0; i < locRegions.length; i += 1) {
      const region = locRegions[i];
      const nodeNames = [];
      const locNodes = [];

      for (let j = 0; j < locPSs.length; j += 1) {
        const ps = locPSs[j];
        if (ps.parentNode) {
          if (ps.parentNode.name === region.name) {
            if (nodeNames.indexOf(ps.name) < 0) {
              const obj = {
                name: ps.name,
                caption: ps.caption
                // sapCode: ps.sapCode
              };
              locNodes.push(obj);
              nodeNames.push(ps.name);
            }

            //   for (let k = 0; k < ps.lep2psConnectors.length; k += 1) {
            //     const lep2ps = ps.lep2psConnectors[k];

            //     if (lep2ps.parentNode) {
            //       const lep = lep2ps.parentNode;

            //       if (nodeNames.indexOf(lep.name) < 0) {
            //         const obj = {
            //           name: lep.name,
            //           caption: lep.caption
            //           // sapCode: lep.sapCode
            //         };
            //         locNodes.push(obj);
            //         nodeNames.push(lep.name);
            //       }
            //     }
            //   }
          }
        }
      }

      locNodes.sort((node1, node2) => {
        if (node1.name > node2.name) {
          return 1;
        }
        if (node1.name < node2.name) {
          return -1;
        }
        return 0;
      });

      const obj = {
        name: region.name,
        caption: region.caption,
        // sapCode: region.sapCode,
        nodes: locNodes
      };
      regions.push(obj);
    }

    regions.sort((reg1, reg2) => {
      if (reg1.name > reg2.name) {
        return 1;
      }
      if (reg1.name < reg2.name) {
        return -1;
      }
      return 0;
    });

    res.json(regions);
    return true;
  });

  app.get("/getSchemaPSs", (req, res) => {
    const names = [];
    const pss = myDataModelSchemas.GetSchemaPSs(req.query.name);
    pss.forEach(ps => {
      const obj = { name: ps.name, caption: ps.caption };
      names.push(obj);
    });
    res.json(names);
    return true;
  });

  app.get("/getSchema", (req, res) => {
    myDataModelSchemas.GetSchema(req.query.name, (err, json) => {
      if (err) {
        res.send(err); // ??
        return false;
      }
      res.send(json);
      return true;
    });
  });

  app.get("/getPSSchema", (req, res, next) => {
    myDataModelSchemas.GetPSSchema(req.query.name, (err, json) => {
      if (err) {
        next(err);
      } else {
        res.send(json);
      }
    });
  });

  app.get("/getPSInfo", (req, res) => {
    const ps = myDataModelNodes.GetNode(req.query.name);
    const obj = { name: "unknown", caption: "unknown" };
    if (ps) {
      obj.name = ps.name;
      obj.caption = ps.caption;
    }
    res.json(obj);
    return true;
  });

  app.get("/getPSParams", (req, res, next) => {
    const paramNames = myDataModelSchemas.GetSchemaParamNamesAsArray(
      `schema_of_${req.query.name}`
    );
    const params = [];
    for (let i = 0; i < paramNames.length; i += 1) {
      const obj = { name: `${paramNames[i]}`, value: 0 };
      params.push(obj);
    }

    res.json(params);
  });

  app.get("/getJsonPS", (req, res) => {
    const json = myDataModelNodes.GetPSForJson(req.query.name);
    res.send(json);
    return true;
  });

  app.get("/getAsutpConnectionsFor", (req, res, next) => {
    DbAsutpConnection.find({ psSapCode: req.query.psSapCode })
      .sort({ voltage: "desc" })
      .limit(500)
      .exec((err, asutpConnections) => {
        if (err) return next(err);
        res.status(200).json(asutpConnections);
        return 0;
      });
  });

  app.post("/savePSLinkage", (req, res, next) => {
    const psName = req.query.name;

    const linkages = req.body;

    async.eachLimit(
      linkages, 100,
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
          logger.info(`Failed: ${err.message}`);
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
};
