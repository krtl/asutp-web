
const NetNode = require('../dbmodels/netNode');

module.exports = (app) => {
  app.get('/nodes', (req, res, next) => {
    NetNode.find({}, (err, nodes) => {
      if (err) return next(err);
      res.json(nodes);
      return true;
    });
  });

  app.get('/nodes/:id', (req, res, next) => {
    NetNode.findById(req.params.id, (err, node) => {
      if (err) {
        return next(err);
      }
      res.json(node);
      return true;
    });
  });
};
