const express = require('express');
const async = require('async');
const logger = require('../logger');

const router = new express.Router();

router.get('/dashboard', (req, res) => {
  res.status(200).json({
    message: "You're authorized to see this secret message.",
  });
});

const NetNode = require('mongoose').model('NetNode');
const NetWire = require('mongoose').model('NetWire');
const DbParam = require('mongoose').model('Param');
const DbParamList = require('mongoose').model('ParamList');
const DbParamValues = require('mongoose').model('ParamValue');

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

    DbParam.find({
      name: { $in: prmList.params } }, (err, params) => {
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
    .limit(5000)
    .exec((err, paramValues) => {
      if (err) return next(err);
      res.status(200).json(paramValues);
      return 0;
    });
});

module.exports = router;
