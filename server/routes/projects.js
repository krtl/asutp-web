const myDataModelParams = require('../models/myDataModelParams');
const myDataModelNodes = require('../models/myDataModelNodes');


module.exports = (app) => {
  app.get('/allparamsasarray', (req, res) => {
    const params = myDataModelParams.getAllParamsAsArray();
    res.json(params);
    return true;
  });

  app.get('/getregions', (req, res) => {
    const params = myDataModelNodes.GetRegions();
    res.json(params);
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
    const ps = myDataModelNodes.GetPSForJson(req.query.name);
    res.json(ps);
    return true;
  });
};
