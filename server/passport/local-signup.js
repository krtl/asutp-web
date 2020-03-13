const AuthUser = require("mongoose").model("AuthUser");
const PassportLocalStrategy = require("passport-local").Strategy;
const userActions = require("./userActions");

/**
 * Return the Passport Local Strategy object.
 */
module.exports = new PassportLocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
    session: false,
    passReqToCallback: true
  },
  (req, email, password, done) => {
    const userData = {
      email: email.trim(),
      password: password.trim(),
      name: req.body.name.trim(),
      role: "user",
      might: ""
    };

    const newUser = new AuthUser(userData);
    newUser.save(err => {
      if (err) {
        return done(err);
      }

      userActions.LogUserAction(
        newUser,
        userActions.Signup,
        "",
        req.headers["x-forwarded-for"] || req.connection.remoteAddress
      );

      return done(null);
    });
  }
);
