var utils     = require('../lib/utils');

var about = require('./about');
var jswig = require('./jswig');
var blogpost = require('./blogpost');
var login = require('./login');
var datarequest = require('./datarequest');
var payment = require('./payment');

// vars set here are available on all pages with sharedPageVars in the route
var sharedPageVars = function(req, res, next) {
  // merge our old utils.getVars() into res.locals
  res.locals(utils.getVars(res.locals));
  next();
}

module.exports = function(app, passport) {

  app.get('/', sharedPageVars, function(req, res) {
    res.render('index');
  });

  app.get('/about/:pagename', sharedPageVars, about);
  app.get('/jswig/*', jswig(app));
  app.get('/blogpost/:id', blogpost);
  app.post('/datarequest', datarequest);

  app.get('/login', sharedPageVars, login.login);
  app.post('/login', login.loginPost(passport));
  app.get('/logout', login.logout);
  app.get('/signup', login.signup);
  app.post('/signup', sharedPageVars, login.signupPost(passport));
  app.get('/profile', utils.isLoggedIn, sharedPageVars, login.profile);
  app.get('/auth/facebook', login.facebookAuth);
  app.get('/auth/facebook/callback', login.facebookAuthCallback);
  app.post('/payment', payment);

  if(process.env.BROWSER_TEST) {
    var browsertest = require('./browsertest');
    app.get('/browsertest/:testname', browsertest);
  }
 
}
