const express = require('express');
const async = require('async');

const router = new express.Router();

router.get('/dashboard', (req, res) => {
  res.status(200).json({
    message: "You're authorized to see this secret message.",
  });
});

const NetNode = require('mongoose').model('NetNode');
const Param = require('mongoose').model('Param');
const ParamList = require('mongoose').model('ParamList');

router.get('/nodes', (req, res, next) => {
  const param = req.query.proj;

  if (!param) {
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

router.post('/save_node', (req, res, next) => {
  const nodes = req.body;
  // throw new Error('TestErr!');

  async.each(nodes, (locNode, callback) => {
    NetNode.findOne({
      id: locNode.id,
    }, (err, netNode) => {
      if (err) {
        console.log('Something wrong when findOne!');
        return callback(err);
      }

      if (netNode) {
         // node exists
        if ((locNode.x !== netNode.x) || (locNode.y !== netNode.y)) {
          netNode.x = locNode.x;
          netNode.y = locNode.y;
          netNode.save((err, updatedNode) => {
            if (err) return callback(err);

            console.log(`updated node ${updatedNode.id}`);

            return callback(null);
          });
        } else {
          return callback(null);
        }
      } else {
         // node does not exist
         // const node = new NetNode();
         // node.save(callback);
        console.log(`node ${locNode.id} does not exist!`);

        return callback(new Error('does not exist!'));
      }
    });
  }, (err) => {
    if (err) {
      console.log(`Failed: ${err}`);
      next(err);
      // res.status(500).json({
      //   message: err.message,
      // });
    } else {
      console.log('All saved successfully');
      res.status(200).json({
        message: "'All saved successfully'",
      });
    }
  });
});

router.get('/paramLists', (req, res, next) => {
  ParamList.find({}, (err, prmLists) => {
    if (err) return next(err);
    res.status(200).json(prmLists);
    return 0;
  });
});

router.get('/params', (req, res, next) => {
  const paramListName = req.query.prmLstName;

  if (!paramListName) {
    res.json({
      error: 'Missing required parameter `prmLstName`',
    });
    return;
  }

  ParamList.findOne({
    name: paramListName,
  }, (err, prmList) => {
    if (err) return next(err);

    Param.find({
      name: { $in: prmList.params } }, (err, nodes) => {
      if (err) return next(err);
      res.status(200).json(nodes);
      return 0;
    });
    return 0;
  });
});


module.exports = router;
