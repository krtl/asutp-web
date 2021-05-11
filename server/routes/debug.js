// const AuthUser = require('mongoose').model('AuthUser');
const AuthUser = require("../dbmodels/authUser");

module.exports = app => {
  app.get("/users", (req, res, next) => {
    AuthUser.find({}, (err, users) => {
      if (err) return next(err);
      res.json(users);
      return true;
    });
  });

  app.get("/users/:id", (req, res, next) => {
    AuthUser.findById(req.params.id, (err, user) => {
      if (err) {
        return next(err);
      }
      res.json(user);
      return true;
    });
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

};
