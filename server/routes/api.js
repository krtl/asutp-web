const express = require('express');
const async = require('async');
const logger = require('../logger');

const NetNode = require('../dbmodels/netNode');
const NetWire = require('../dbmodels/netWire');
const DbParam = require('../dbmodels/param');
const DbParamValues = require('../dbmodels/paramValue');
const DbParamHalfHourValues = require('../dbmodels/paramHalfHourValue');
const DbNodeStateValue = require('../dbmodels/nodeStateValue');
const DbNodeCoordinates = require('../dbmodels/nodeCoordinates');
const DbNodeSchema = require('../dbmodels/nodeSchema');

const myDataModelNodes = require('../models/myDataModelNodes');


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

router.get('/schemas', (req, res, next) => {  // currently not used
  DbNodeSchema.find({}, (err, schemas) => {
    if (err) return next(err);
    res.status(200).json(schemas);
    return 0;
  });
});

router.get('/params', (req, res, next) => {
  const schemaName = req.query.schemaName;

  if ((!schemaName) || (schemaName === '')) {
    res.json({
      error: 'Missing required parameter `schemaName`!',
    });
    return;
  }

  DbNodeSchema.findOne({
    name: schemaName,
  }, (err, prmList) => {
    if (err) return next(err);

    if (prmList) {
      const locParams = prmList.paramNames.split(',');
      DbParam.find({
        name: { $in: locParams } }, (err, params) => {
        if (err) return next(err);
        res.status(200).json(params);
        return 0;
      });
    } else {
      res.status(200).json([]);
    }
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

// obsolete
router.get('/getNodeCoordinates', (req, res, next) => {
  const schemaName = req.query.schemaName;

  if ((!schemaName) || (schemaName === '')) {
    res.json({
      error: 'Missing required parameter `schemaName`!',
    });
    return;
  }

  DbNodeCoordinates
    .find({ schemaName })
    .select({ nodeName: 1, x: 1, y: 1, _id: 0 })
    .limit(10000)
    .exec((err, schemaNodes) => {
      if (err) return next(err);
      res.status(200).json(schemaNodes);
      return 0;
    });
});

router.post('/saveNodeCoordinates', (req, res, next) => {
  const schemaName = req.query.schemaName;

  if ((!schemaName) || (schemaName === '')) {
    res.json({
      error: 'Missing required parameter `schemaName`!',
    });
    return;
  }

  const nodes = req.body;

  async.each(nodes, (locNode, callback) => {
    DbNodeCoordinates.findOne({
      schemaName,
      nodeName: locNode.nodeName,
    }, (err, netNode) => {
      if (err) {
        logger.info(`[saveNodeCoordinates] findOne error: ${err}`);
        return callback(err);
      }

      if (netNode) {
        if ((locNode.x !== netNode.x) || (locNode.y !== netNode.y)) {
          DbNodeCoordinates.update({ _id: netNode.id },
            { $set: {
              x: locNode.x,
              y: locNode.y } }, (err) => {
                if (err) return callback(err);

                logger.debug(`[saveNodeCoordinates] updated node "${netNode.nodeName}" in "${schemaName}"`);

                return callback(null);
              });
        } else {
          return callback(null);
        }
      } else {
        const newNodeCoordinates = new DbNodeCoordinates(locNode);
        newNodeCoordinates.nodeName = locNode.nodeName;
        newNodeCoordinates.schemaName = schemaName;
        newNodeCoordinates.save((err) => {
          if (err) {
            logger.warn(`[saveNodeCoordinates] newNetNodeShema.save error: ${err}`);
            return callback(err);
          }
          logger.debug(`[saveNodeCoordinates] node "${locNode.nodeName}" inserted into "${schemaName}"`);

          return callback(null);
        });
      }
      return null;
    });
  }, (err) => {
    if (err) {
      logger.info(`[saveNodeCoordinates] Failed: ${err}`);
      next(err);
      // res.status(500).json({
      //   message: err.message,
      // });
    } else {
      logger.debug('[saveNodeCoordinates] All saved successfully');
      res.status(200).json({
        message: "'All saved successfully'",
      });
    }
  });
});

router.post('/saveManualNodeStates', (req, res, next) => {
  const manualtates = req.body;
  const err = myDataModelNodes.SetManualStates(manualtates);

  if (err) {
    logger.info(`[saveManualNodeStates] Failed: ${err}`);
    next(err);
    // res.status(500).json({
    //   message: err.message,
    // });
  } else {
    logger.debug('[saveManualNodeStates] All saved successfully');
    res.status(200).json({
      message: "'All saved successfully'",
    });
  }
});


module.exports = router;
