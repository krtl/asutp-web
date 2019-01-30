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

  if (!paramListName) {
    res.json({
      error: 'Missing required parameter `prmLstName`!',
    });
    return;
  }

  if ((paramListName === '') || (paramListName === 'undefined')) {
    res.json({
      error: 'Required parameter `prmLstName` is wrong!',
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

  if (!paramName) {
    res.json({
      error: 'Missing required parameter `paramName`!',
    });
    return;
  }

  if ((paramName === '') || (paramName === 'undefined')) {
    res.json({
      error: 'Required parameter `paramName` is wrong!',
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

  if (!paramName) {
    res.json({
      error: 'Missing required parameter `paramName`!',
    });
    return;
  }

  if ((paramName === '') || (paramName === 'undefined')) {
    res.json({
      error: 'Required parameter `paramName` is wrong!',
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

  if (!nodeName) {
    res.json({
      error: 'Missing required parameter `nodeName`!',
    });
    return;
  }

  if ((nodeName === '') || (nodeName === 'undefined')) {
    res.json({
      error: 'Required parameter `nodeName` is wrong!',
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


module.exports = router;
