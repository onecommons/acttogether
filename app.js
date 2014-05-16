/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var path = require('path');
var consolidate = require('consolidate');
var swig = require('swig');
require('./lib/swigextensions')(swig);
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var FileStore = require('connect-session-file');
var util = require('util');
var models = require('./models');

// return a minimally configured app object
function createApp() {
  var app = express();

  require('./config/passport')(passport); // pass passport for configuration

  // all environments
  app.set('views', path.join(__dirname, 'views'));
  app.engine('html', consolidate.swig);
  swig.setDefaults({ cache: false });
  app.set('view engine', 'html');

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here')); //XXX
  app.use(express.session({
    store: new FileStore()
  }));

  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session

  // development only (needs to appear before static)
  if ('development' == app.get('env')) {
    // add development vars to res.locals (enables debug_footer)
    app.use(function debugFooterHandler(req, res, next) {
      res.locals.debug = true;
      res.locals.req = req;
      next();
    });
  }

  app.use(app.router);

  app.use(require('less-middleware')({
    src: path.join(__dirname, 'public')
  }));
  app.use(require('sass-middleware')({
    src: path.join(__dirname, 'public')
  }));
  app.use(express.static(path.join(__dirname, 'public')));

  // development only
  if ('development' == app.get('env')) {
    app.use(express.errorHandler());
  }

  //
  // routes
  //
  routes(app, passport);

  // app.use(require('express-domain-middleware')); // to better handle errors without crashing node
  // error handler
  // app.use(function(err,req,res,next){
  //   console.error("An error occurred:", err.message);
  //   console.error("err.stack: ", err.stack);
  //   res.send(500);
  // });

  return app;
}

function configureApp(app) {
  var configDB = null;
  try {
    configDB = require('./config/database.js');
  } catch (err) {
    if (err.code == "MODULE_NOT_FOUND") {
      var defaultDbUrl = "mongodb://127.0.0.1:27017/ocdemo";
      console.log("WARNING: ./config/database.js not found, using", defaultDbUrl);
      configDB = {url: defaultDbUrl}
    } else {
      throw err;
    }
  }
  mongoose.connect(configDB.url); // connect to our database

  app.set('port', process.env.PORT || 3000);

  // using keystone's update.js, a data migration system: see
  //  http://keystonejs.com/docs/configuration/#updates
  app.set('autoUpdates', true);
}

function startApp(app) {
  var server = app.listen(app.get('port'), 'localhost', function() {
    console.log('Express server listening on port %d', server.address().port);
  });
  return server;
}

module.exports = {
  dirname: __dirname,
  createApp: createApp,
  configureApp: configureApp,
  startApp: startApp
}

// check to see if we're the main module (i.e. run directly, not require()'d)
if (require.main === module) {

  var app = createApp();
  configureApp(app);

  // XXX exposed startApp should probably do this...
  // optionally apply data migrations in /updates folder before starting server.
  if(app.set('autoUpdates')) {
    console.log("checking for autoupdates to apply...");

    require('keystone').connect(mongoose); // need to do this for updates to work.
    var updates = require('keystone/lib/updates');

    updates.apply(function(){
      startApp(app);
    });
  } else {
    startApp(app);
  }
}
