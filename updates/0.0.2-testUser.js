var User = require('../models/user');

exports = module.exports = function(done) {
   // make a test user 
   u = new User();
   u.displayName = 'TestUser';
   u.local.email = 'test@user.com';
   u.local.password = '$2a$08$/06iuOSo3ws1QzBpvRrQG.jgRwuEJB20LcHsWyEWHhOEm/ztwqPG.' // testuser
   u._id = "@User@0";
   u.save(function(err,uback){
    done();
   });
}; 
