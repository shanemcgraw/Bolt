var Q = require('q');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;


var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  salt: String,
  firstName: {
    type: String,
    default: "Johnny"
  },
  lastName: {
    type: String,
    default: "Sprintzer"
  },
  email: String,
  phone: Number,
  // How far they want to go on their races
  preferredDistance: {
    type: Number,
    default: 1
  },
  mileSpeed: {
    type: Number,  // in minutes/mile
    default: 10
  },
  runs: {
    // A record of all runs in a user's history
    type: Array,
    default: []
  },
  personalBest: Number, // Personal best in min/mile
  achievements: {
    type: Object,
    default: { // Object of all lifetime medals received
      Gold: 0,
      Silver: 0,
      Bronze: 0,
      'High Five': 0,
      Iron: 0 // experimental (for when you beat an opponent's personal best)
    }
  }
});

UserSchema.methods.comparePasswords = function (candidatePassword) {
  var savedPassword = this.password;
  return Q.Promise(function (resolve, reject) {
    bcrypt.compare(candidatePassword, savedPassword, function (err, isMatch) {
      if (err) {
        reject(err);
      } else {
        resolve(isMatch);
      }
    });
  });
};

UserSchema.pre('save', function (next) {
  var user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) {
    return next();
  }
  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) {
      return next(err);
    }
    // hash the password along with our new salt
    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) {
        return next(err);
      }
      // override the cleartext password with the hashed one
      user.password = hash;
      user.salt = salt;
      next();
    });
  });
});

module.exports = mongoose.model('users', UserSchema);