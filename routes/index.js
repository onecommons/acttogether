var utils           = require('../lib/utils');
var express         = require('express');
  
var about           = require('./about');
var jswig           = require('./jswig');
var blogpost        = require('./blogpost');
var login           = require('./login');
var profile         = require('./profile');
var directory       = require('./directory');
var datarequest     = require('./datarequest');
var payments        = require('./payments');
var namedRoutes = {};

// vars set here are available on all pages with sharedPageVars in the route
var sharedPageVars = function(req, res, next) {
  // merge our old utils.getVars() into res.locals
  res.locals(utils.getVars());
  res.locals.routes = namedRoutes;
  next();
}


module.exports = function(app, passport) {
  //enables named routes, eg <a href='{{routes.profile}}'>my profile</a>
  var routes = {
    index: ['/', sharedPageVars, function(req, res) { res.render('index'); }]
    //use this form for methods other than GET
    ,login:   {get:[sharedPageVars, login.login],post: [login.loginPost(passport)]}
    ,logout:    [login.logout]
    ,signup:  {get:login.signup, post: [sharedPageVars, login.signupPost(passport)]}
    ,setupPaymentPlan: {path: 
                '/profile/setup-payment-plan'
                        ,get: [sharedPageVars, utils.isLoggedIn, function(req,res){res.render('profile/setup-payment-plan');}]
                        ,post: [utils.isLoggedIn, payments.setupPaymentPlanPost]
    }
    ,editPaymentPlan: ['/profile/edit-payment-plan', utils.isLoggedIn, sharedPageVars, profile.editPaymentPlan]
    ,datarequest: {post: datarequest}
    ,profile: [utils.isLoggedIn, sharedPageVars, login.profile]
    ,userTransactions: ['/profile/transactions', utils.isLoggedIn, sharedPageVars, profile.transactionHistory]
    ,directory: ['/directory', sharedPageVars, directory.fullDirectory]
    ,directoryItem: ['/directory/id', sharedPageVars, directory.directoryItem] //XXX this is a temporary hacky thing. need to support customized urls and have way to reference them
  };

  app.get('/about/:pagename', sharedPageVars, about);
  app.get('/jswig/*', jswig(app));
  app.get('/blogpost/:id', blogpost);
  app.get('/auth/facebook', login.facebookAuth);
  app.get('/auth/facebook/callback', login.facebookAuthCallback);

  for (var name in routes) {
    var route = routes[name];
    if (!Array.isArray(route)) {
      var path = route.path || '/'+name;
      for (var key in route) {
        if (key == "path" || !app[key])
          continue;
        //call app.METHOD(path, ...route[METHOD]):
        app[key].apply(app, [path].concat(route[key]));
      }
      namedRoutes[name] = path;
    } else {
      if (typeof route[0] !== 'string') {
        var path = '/'+name; //use varname as path
        app.get.apply(app, [path].concat(route));
        namedRoutes[name] = path;
      } else {
        app.get.apply(app, route);
        namedRoutes[name] = route[0];
      }
    }
  }

  if(process.env.BROWSER_TEST) {
    var browsertest = require('./browsertest');
    app.get('/browsertest/:testname', browsertest);
  }
 
}
