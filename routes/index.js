var utils     = require('utils');

var about = require('./about');
var jswig = require('./jswig');
var blogpost = require('./blogpost');
var login = require('./login');
var datarequest = require('./datarequest');

var browsertest = require('./browsertest');

module.exports = function(app, passport) {

  app.get('/', function(req, res) {
    res.render('index', utils.getVars());
  });

  app.get('/about/:pagename', about);
  app.get('/jswig/:tmpl', jswig);
  app.get('/blogpost/:id', blogpost);
  app.post('/datarequest', datarequest);

  app.get('/login', login.login);
  app.post('/login', login.loginPost(passport));
  app.get('/logout', login.logout);
  app.get('/signup', login.signup);
  app.post('/signup', login.signupPost(passport));
  app.get('/profile', utils.isLoggedIn, login.profile);
  app.get('/auth/facebook', login.facebookAuth);
  app.get('/auth/facebook/callback', login.facebookAuthCallback);

  if(process.env.BROWSER_TEST) {
    app.get('/browsertest/:testname', browsertest);
  }
 
}
