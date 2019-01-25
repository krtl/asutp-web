const async = require('async');
const logger = require('../logger');
const myDataModelParams = require('../models/myDataModelParams');
const myDataModelNodes = require('../models/myDataModelNodes');
const DbAsutpConnection = require('../dbmodels/asutpConnection');
const DbNodeParamLinkage = require('../dbmodels/nodeParamLinkage');


module.exports = (app) => {
  app.get('/allParamsAsArray', (req, res) => {
    const params = myDataModelParams.getAllParamsAsArray();
    res.json(params);
    return true;
  });

  app.get('/getRegions', (req, res) => {
    const names = [];
    const regions = myDataModelNodes.GetRegions();
    regions.forEach((reg) => {
      const obj = { name: reg.name, caption: reg.caption, sapCode: reg.sapCode };
      names.push(obj);
    });
    res.json(names);
    return true;
  });

  app.get('/getRegionPSs', (req, res) => {
    const names = [];
    const pss = myDataModelNodes.GetRegionPSs(req.query.name);
    pss.forEach((ps) => {
      const obj = { name: ps.name, caption: ps.caption };
      names.push(obj);
    });
    res.json(names);
    return true;
  });

  app.get('/getJsonPS', (req, res) => {
    const json = myDataModelNodes.GetPSForJson(req.query.name);
    res.send(json);
    return true;
  });

  app.get('/getAsutpConnectionsFor', (req, res, next) => {
    DbAsutpConnection
    .find({ psSapCode: req.query.psSapCode })
    .sort({ voltage: 'desc' })
    .limit(500)
    .exec((err, asutpConnections) => {
      if (err) return next(err);
      res.status(200).json(asutpConnections);
      return 0;
    });
  });

  app.post('/savePSLinkage', (req, res, next) => {
    // const ps = myDataModelNodes.GetNode(req.query.name);

    const linkages = req.body;

    async.each(linkages, (locLinkage, callback) => {
      DbNodeParamLinkage.findOne({
        nodeName: locLinkage.nodeName,
        paramPropName: locLinkage.paramPropName,
      }, (err, linkage) => {
        if (err) {
          logger.warn('Something wrong when DbNodeParamLinkage findOne!');
          return callback(err);
        }

        if (linkage) {
          if (locLinkage.paramPropValue !== linkage.paramPropValue) {
            DbNodeParamLinkage.update({ _id: linkage.id },
              { $set: {
                // caption: locNode.caption,
                // description: locNode.description,
                paramPropValue: locLinkage.paramPropValue,
              } }, (err) => {
                if (err) {
                  logger.warn('Something wrong when DbNodeParamLinkage update!');
                  return callback(err);
                }

                logger.info(`updated nodeLinkage "${linkage.nodeName}.${linkage.paramPropName}"`);

                return callback(null);
              });
          } else {
            return callback(null);
          }
        } else {
          const newNodeParamLinkage = new DbNodeParamLinkage(locLinkage);

          newNodeParamLinkage.save((err) => {
            if (err) {
              logger.warn('Something wrong when DbNodeParamLinkage save!');
              return callback(err);
            }
            logger.log(`nodeLinkage "${locLinkage.nodeName}.${locLinkage.paramPropName}" inserted`);

            return callback(null);
          });
        }
        return 0;
      });
    }, (err) => {
      if (err) {
        logger.info(`Failed: ${err}`);
        next(err);
        // res.status(500).json({
        //   message: err.message,
        // });
      } else {
        logger.info('All nodeLinkages are saved successfully');

        myDataModelNodes.RelinkParamNamesToNodes((err) => {
          if (err) {
            logger.warn('Something wrong on RelinkParamsToNodes!');
          } else {
            logger.info('Nodes are successfully relinked to Params.');
          }
        });

        res.status(200).json({
          message: "'All nodeLinkages are saved successfully'",
        });
      }
    });
  });
};
