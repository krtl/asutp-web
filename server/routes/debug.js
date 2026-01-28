const request = require("request");
// const AuthUser = require('mongoose').model('AuthUser');
const AuthUser = require("../dbmodels/authUser");
const config = require("../../config");

module.exports = app => {
  app.get("/users", async (req, res, next) => {

    const users = await AuthUser.find({});
    res.json(users);
    return true;

  });

  app.get("/users/:id", async (req, res, next) => {
    const user = await AuthUser.findById(req.params.id)
      res.json(user);
      return true;
  });

  app.get("/allParamsAsArray", (req, res) => {
    const params = myDataModelNodes.GetAllParamsAsArray();
    res.status(200).json(params);
    return true;
  });

  app.get("/getCommunacationParamNames", (req, res) => {
    res.status(200).json(myDataModelNodes.GetCommunacationParamNames());
    return 0;
  });  

  app.get("/SetTheLastDayOfTheUniverse", (req, res, next) => {
    request(
      `http://${config.recalculationServerHost}:8081/SetTheLastDayOfTheUniverse`,
      { json: true },
      (err, resp, body) => {
        if (err) return next(err);
        res.status(200).json(body);
        return 0;
      }
    );
  });

};
