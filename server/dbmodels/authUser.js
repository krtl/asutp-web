const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// define the User model schema
const AuthUserSchema = new mongoose.Schema({
  email: {
    type: String,
    index: { unique: true },
  },
  password: String,
  name: String,
  role: String,
  might: String,
  created: {
    type: Date,
    default: Date.now,
  },
  activity: {
    type: Number,
    default: 0,
  },
});// , {
//   autoIndex: process.env('mode') == 'development'
// });


/**
 * Compare the passed password with the value in the database. A model method.
 *
 * @param {string} password
 * @returns {object} callback
 */
AuthUserSchema.methods.comparePassword = function comparePassword(password, callback) {
  bcrypt.compare(password, this.password, callback);
};


/**
 * The pre-save hook method.
 */
// AuthUserSchema.pre('save', function saveHook(next) {
//   const user = this;

//   // proceed further only if the password is modified or the user is new
//   if (!user.isModified('password')) return next();


//   return bcrypt.genSalt((saltError, salt) => {
//     if (saltError) { return next(saltError); }

//     return bcrypt.hash(user.password, salt, (hashError, hash) => {
//       if (hashError) { return next(hashError); }

//       // replace a password string with hash value
//       user.password = hash;

//       return next();
//     });
//   });
// });

AuthUserSchema.pre("save", async function() {
 if (!this.isModified("password")) {
  return;
 }
 const salt = await bcrypt.genSalt(10);
 const hashedPassword = await bcrypt.hash(this.password, salt);
 this.password = hashedPassword; 
});


module.exports = mongoose.model('AuthUser', AuthUserSchema);
