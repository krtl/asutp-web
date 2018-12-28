const myDataModelParams = require('../models/myDataModelParams');
const myDataModelNodes = require('../models/myDataModelNodes');
const DbAsutpConnection = require('../dbmodels/asutpConnection');


module.exports = (app) => {
  app.get('/allparamsasarray', (req, res) => {
    const params = myDataModelParams.getAllParamsAsArray();
    res.json(params);
    return true;
  });

  app.get('/getregions', (req, res) => {
    const names = [];
    const regions = myDataModelNodes.GetRegions();
    regions.forEach((reg) => {
      const obj = { name: reg.name, caption: reg.caption, sapCode: reg.sapCode };
      names.push(obj);
    });
    res.json(names);
    return true;
  });

  app.get('/getregionpss', (req, res) => {
    const names = [];
    const pss = myDataModelNodes.GetRegionPSs(req.query.name);
    pss.forEach((ps) => {
      const obj = { name: ps.name, caption: ps.caption };
      names.push(obj);
    });
    res.json(names);
    return true;
  });

  app.get('/getjsonps', (req, res) => {
    const json = myDataModelNodes.GetPSForJson(req.query.name);
    res.send(json);
    return true;
  });

  app.get('/getasutpconnectionsfor', (req, res, next) => {
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
};
