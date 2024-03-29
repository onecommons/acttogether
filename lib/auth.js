var User         = require('../models/user');
var LoginHistory = require('../models/loginhistory');

var config = require('../lib/config')('auth'); // XXX this file should live elsewhere

module.exports.recordLogin = function(user, status, ipAddress) {
    var hist = new LoginHistory();
    hist.user = user;
    hist.ip = ipAddress;
    hist.status = status;

    hist.save(function(err) {
        if (err) {
            console.log("Error saving login history!");
            console.log(err);
        }
    });
}

module.exports.checkVerificationToken = function(token, callback) {

  User.findOne({"local.signupToken":token}, function(err, user) {
    if (err) {
      callback("error looking up user with token:" + token, null);
      return;
    }

    if (!user) {
      callback("couldn't find user with token:" + token, null);
      return
    }

    console.log("found user");
    console.log(user);

    if (user.local.signupTokenExpires < new Date()) {
      callback("signup token expired at:" + user.local.signupTokenExpires, null);
      return;
    }

    user.local.signupToken = null;
    user.local.signupTokenExpires = null;
    user.local.verified = true;
    // XXX should we store verification timestamp? maybe user creation timestamp also?

    user.save(function(err) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, user);
      }
    });

  });

}
