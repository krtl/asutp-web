const async = require("async");
const logger = require("../logger");
const myDataModelNodes = require("../models/myDataModelNodes");
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
    const schemas = myDataModelNodes.GetNodeSchemas();
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

  app.get("/getSchemaPSs", (req, res) => {
    const names = [];
    const pss = myDataModelNodes.GetSchemaPSs(req.query.name);
    pss.forEach(ps => {
      const obj = { name: ps.name, caption: ps.caption };
      names.push(obj);
    });
    res.json(names);
    return true;
  });

  app.get("/getSchema", (req, res) => {
    myDataModelNodes.GetSchema(req.query.name, (err, json) => {
      if (err) {
        res.send(err); // ??
        return false;
      }
      res.send(json);
      return true;
    });
  });

  app.get("/getPSSchema", (req, res) => {
    myDataModelNodes.GetPSSchema(req.query.name, (err, json) => {
      if (err) {
        res.send(err); // ??
        return false;
      }
      res.send(json);
      return true;
    });
  });

  app.get("/getPSParams", (req, res) => {
    const paramNames = myDataModelNodes.GetPSSchemaParamNames(req.query.name);
    const params = [];
    paramNames.forEach(name => {
      const obj = { name, value: 0 };
      params.push(obj);
    });

    res.json(params);
    return true;
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

    async.each(
      linkages,
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
                DbNodeParamLinkage.update(
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
                        `[savePSLinkage] Something wrong when DbNodeParamLinkage update  for "${psName}"!`
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
          logger.info(`Failed: ${err}`);
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
                `[savePSLinkage] Something wrong on RelinkParamsToNodes for "${psName}"!`
              );
            } else {
              logger.info(
                `[savePSLinkage] Nodes are successfully relinked to Params for "${psName}"`
              );

              myDataModelNodes.ReloadPSSchemaParams(psName, err => {
                if (err) {
                  logger.warn(
                    `[savePSLinkage] Something wrong on ReloadPSSchemaParams for "${psName}"!`
                  );
                } else {
                  logger.info(
                    `[savePSLinkage] PSSchema params "${psName}" successfully reloaded.`
                  );
                }
              });
            }
          });

          res.status(200).json({
            message: `All nodeLinkages are saved successfully for "${psName}"`
          });
        }
      }
    );
  });
};
