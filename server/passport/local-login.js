const jwt = require('jsonwebtoken');
const AuthUser = require('mongoose').model('AuthUser');
const PassportLocalStrategy = require('passport-local').Strategy;
const config = require('../../config');


/**
 * Return the Passport Local Strategy object.
 */
module.exports = new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true,
}, async (req, email, password, done) => {
  const userData = {
    email: email.trim(),
    password: password.trim(),
  };

  // find a user by email address
  let user = null;
  try {
    user = await AuthUser.findOne({ email: userData.email });
  } catch (err) {
    return done(err);
  }
if (!user) {
      const error = new Error('Incorrect email or password');
      error.name = 'IncorrectCredentialsError';

      return done(error);
    }
    // check if a hashed user's password is equal to a value saved in the database
    return user.comparePassword(userData.password, (err, isMatch) => {
      if (err) { return done(err); }

      if (!isMatch) {
        const error = new Error('Incorrect email or password');
        error.name = 'IncorrectCredentialsError';

        return done(error);
      }

      const payload = {
        sub: user._id,
      };

      // create a token string
      const token = jwt.sign(payload, config.jwtSecret);
      const data = {
        name: user.name + ";" + user.might,
      };

      return done(null, token, data);
    });

});
