
// const AuthUser = require('mongoose').model('AuthUser');
const AuthUser = require('../dbmodels/authUser');

module.exports = (app) => {
  app.get('/users', (req, res, next) => {
    AuthUser.find({}, (err, users) => {
      if (err) return next(err);
      res.json(users);
    });
  });

  app.get('/users/:id', (req, res, next) => {
    AuthUser.findById(req.params.id, (err, user) => {
      if (err) {
        return next(err);
      }
      res.json(user);
    });
  });

};
