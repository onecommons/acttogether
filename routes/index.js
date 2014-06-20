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
  res.locals.df = require("../lib/dataForm").dataform();
  next();
}

function renderer(view) {return function(req, res) { res.render(view);}; }

module.exports = function(app, passport) {
  //enables named routes, eg <a href='{{routes.profile}}'>my profile</a>
  var routes = {

    index:            ['/', sharedPageVars, renderer('index')],

    login:            { get:  [ sharedPageVars, login.login],
                        post: [ login.loginPost(passport)]},

    logout:           login.logout,

    signup:           { get:  login.signup,
                        post: [ sharedPageVars, login.signupPost(passport)]},

    verification:     login.verification, 

    setupPaymentPlan: { path: '/profile/setup-payment-plan',
                        get:  [ sharedPageVars, utils.isLoggedIn, renderer('setup-payment-plan')],
                        post: [ utils.isLoggedIn, payments.setupPaymentPlanPost] },

    fundCampaign:     { path: '/fund-campaign/:id',
                        get:  [ sharedPageVars, utils.isLoggedIn, payments.fundCampaignGet],
                        post: [ utils.isLoggedIn, payments.fundCampaignPost] },

    fundCampaignNoId: { path: '/fund-campaign',
                        get:  [ sharedPageVars, utils.isLoggedIn, payments.fundCampaignGet] },

    datarequest:      { post: datarequest},

    profile:          [ utils.isLoggedIn, sharedPageVars, login.profile],

    userTransactions: [ '/profile/transactions', utils.isLoggedIn, sharedPageVars, profile.transactionHistory],

    directory:        [ '/directory', sharedPageVars, directory.fullDirectory],

    directoryItem:    [ '/directory/:id', sharedPageVars, directory.directoryItem] //XXX this is a temporary hacky thing. need to support customized urls and have way to reference them
 
  };

  app.get('/about/:pagename',        sharedPageVars, about);
  app.get('/jswig/*',                jswig(app));
  app.get('/blogpost/:id',           blogpost);
  app.get('/auth/facebook',          login.facebookAuth);
  app.get('/auth/facebook/callback', login.facebookAuthCallback);

  for (var name in routes) {
    var route = routes[name];

    if (typeof route === 'function') {
        var path = '/'+name; //use varname as path
        app.get(path, route);
        namedRoutes[name] = path;

    } else if (!Array.isArray(route)) {
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

}
