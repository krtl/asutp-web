const express = require('express');
const async = require('async');
const logger = require('../logger');

const NetNode = require('../dbmodels/netNode');
const NetWire = require('../dbmodels/netWire');
const DbParam = require('../dbmodels/param');
const DbParamList = require('../dbmodels/paramList');
const DbParamValues = require('../dbmodels/paramValue');
const DbParamHalfHourValues = require('../dbmodels/paramHalfHourValue');
const DbNodeStateValue = require('../dbmodels/nodeStateValue');
const DbNetNodeShema = require('../dbmodels/netNodeSchema');


const router = new express.Router();

router.get('/dashboard', (req, res) => {
  res.status(200).json({
    message: "You're authorized to see this secret message.",
  });
});

router.get('/nodes', (req, res, next) => {
  const project = req.query.proj;

  if (!project) {
    res.json({
      error: 'Missing required parameter `proj`',
    });
    return;
  }

  NetNode.find({}, (err, nodes) => {
    if (err) return next(err);
    res.status(200).json(nodes);
    return 0;
  });
});

router.get('/wires', (req, res, next) => {
  const project = req.query.proj;

  if (!project) {
    res.json({
      error: 'Missing required parameter `proj`',
    });
    return;
  }

  NetWire.find({}, (err, wires) => {
    if (err) return next(err);
    res.status(200).json(wires);
    return 0;
  });
});

router.post('/save_node', (req, res, next) => {
  const nodes = req.body;
  // throw new Error('TestErr!');

  async.each(nodes, (locNode, callback) => {
    NetNode.findOne({
      name: locNode.name,
    }, (err, netNode) => {
      if (err) {
        logger.info('Something wrong when findOne!');
        return callback(err);
      }

      if (netNode) {
         // node exists
        if ((locNode.x !== netNode.x) || (locNode.y !== netNode.y)) {
          NetNode.update({ _id: netNode.id },
            { $set: {
              // caption: locNode.caption,
              // description: locNode.description,
              x: locNode.x,
              y: locNode.y } }, (err) => {
                if (err) return callback(err);

                logger.info(`updated node ${netNode.name}`);

                return callback(null);
              });
        } else {
          return callback(null);
        }
      } else {
        logger.info(`node ${locNode.name} does not exist!`);

        return callback(new Error('does not exist!'));
      }
      return null;
    });
  }, (err) => {
    if (err) {
      logger.info(`Failed: ${err}`);
      next(err);
      // res.status(500).json({
      //   message: err.message,
      // });
    } else {
      logger.info('All saved successfully');
      res.status(200).json({
        message: "'All saved successfully'",
      });
    }
  });
});

router.get('/paramLists', (req, res, next) => {
  DbParamList.find({}, (err, prmLists) => {
    if (err) return next(err);
    res.status(200).json(prmLists);
    return 0;
  });
});

router.get('/params', (req, res, next) => {
  const paramListName = req.query.prmLstName;

  if ((!paramListName) || (paramListName === '')) {
    res.json({
      error: 'Missing required parameter `prmLstName`!',
    });
    return;
  }

  DbParamList.findOne({
    name: paramListName,
  }, (err, prmList) => {
    if (err) return next(err);

    const locParams = prmList.paramNames.split(',');
    DbParam.find({
      name: { $in: locParams } }, (err, params) => {
      if (err) return next(err);
      res.status(200).json(params);
      return 0;
    });
    return 0;
  });
});

router.get('/paramValues', (req, res, next) => {
  const paramName = req.query.paramName;

  if ((!paramName) || (paramName === '')) {
    res.json({
      error: 'Missing required parameter `paramName`!',
    });
    return;
  }

  DbParamValues
    .find({ paramName })
    .sort({ dt: 'desc' })
    .limit(500)
    .exec((err, paramValues) => {
      if (err) return next(err);
      res.status(200).json(paramValues);
      return 0;
    });
});

router.get('/paramHalfHourValues', (req, res, next) => {
  const paramName = req.query.paramName;

  if ((!paramName) || (paramName === '')) {
    res.json({
      error: 'Missing required parameter `paramName`!',
    });
    return;
  }

  DbParamHalfHourValues
    .find({ paramName })
    .sort({ dt: 'desc' })
    .limit(500)
    .exec((err, paramValues) => {
      if (err) return next(err);
      res.status(200).json(paramValues);
      return 0;
    });
});


router.get('/nodeStateValues', (req, res, next) => {
  const nodeName = req.query.nodeName;

  if ((!nodeName) || (nodeName === '')) {
    res.json({
      error: 'Missing required parameter `nodeName`!',
    });
    return;
  }

  DbNodeStateValue
    .find({ nodeName })
    .select({ nodeName: 1, oldState: 1, newState: 1, dt: 1, _id: 0 })
    .sort({ dt: 'desc' })
    .limit(500)
    .exec((err, nodeStateValues) => {
      if (err) return next(err);
      res.status(200).json(nodeStateValues);
      return 0;
    });
});


router.get('/netNodeSchema', (req, res, next) => {
  const schemaName = req.query.schemaName;

  if ((!schemaName) || (schemaName === '')) {
    res.json({
      error: 'Missing required parameter `schemaName`!',
    });
    return;
  }

  DbNetNodeShema
    .find({ schemaName })
    .select({ nodeName: 1, x: 1, y: 1, _id: 0 })
    .limit(10000)
    .exec((err, schemaNodes) => {
      if (err) return next(err);
      res.status(200).json(schemaNodes);
      return 0;
    });
});

router.post('/saveNetNodeSchema', (req, res, next) => {
  const schemaName = req.query.schemaName;

  if ((!schemaName) || (schemaName === '')) {
    res.json({
      error: 'Missing required parameter `schemaName`!',
    });
    return;
  }

  const nodes = req.body;
  // throw new Error('TestErr!');

  async.each(nodes, (locNode, callback) => {
    DbNetNodeShema.findOne({
      schemaName,
      nodename: locNode.name,
    }, (err, netNode) => {
      if (err) {
        logger.info(`[saveNetNodeSchema] findOne error: ${err}`);
        return callback(err);
      }

      if (netNode) {
         // node exists
        if ((locNode.x !== netNode.x) || (locNode.y !== netNode.y)) {
          NetNode.update({ _id: netNode.id },
            { $set: {
              // caption: locNode.caption,
              // description: locNode.description,
              x: locNode.x,
              y: locNode.y } }, (err) => {
                if (err) return callback(err);

                logger.debug(`[saveNetNodeSchema] updated node "${netNode.name}" in "${schemaName}"`);

                return callback(null);
              });
        } else {
          return callback(null);
        }
      } else {
        const newNetNodeShema = new DbNetNodeShema(locNode);
        newNetNodeShema.nodeName = locNode.name;
        newNetNodeShema.schemaName = schemaName;
        newNetNodeShema.save((err) => {
          if (err) {
            logger.warn(`[saveNetNodeSchema] newNetNodeShema.save error: ${err}`);
            return callback(err);
          }
          logger.debug(`[saveNetNodeSchema] node "${locNode.name}" inserted into "${schemaName}"`);

          return callback(null);
        });
      }
      return null;
    });
  }, (err) => {
    if (err) {
      logger.info(`[saveNetNodeSchema] Failed: ${err}`);
      next(err);
      // res.status(500).json({
      //   message: err.message,
      // });
    } else {
      logger.debug('[saveNetNodeSchema] All saved successfully');
      res.status(200).json({
        message: "'All saved successfully'",
      });
    }
  });
});


module.exports = router;
