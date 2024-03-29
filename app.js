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
var models = require('./models');
var _ = require('underscore');
var loadConfig = require('./lib/config');
var util = require('util');
var crypto = require('crypto');

var STOP_APP_TIMEOUT = 30*1000;
function stopApp(closeCallback, forcequit) {
  var onclose = function() {
    mongoose.connection.close(closeCallback);
  };
  this.gracefullyExiting = true;
  if (this.server)
    this.server.close(onclose)
  else
    onclose();

  if (forcequit) {
    var timeout = typeof forcequit == "number" ? forcequit : STOP_APP_TIMEOUT;
    setTimeout( function () {
      console.error("Could not close connections in time, forcefully shutting down");
      process.exit(1);
    }, timeout);
  }
}

/*
@param ready function called
if ready is defined it is the responsibility of that function to start listening (if desired) by calling the supplied listen function.
e.g.:
function ready(listen) {
   //do more stuff
   //if you want to initiate listening:
   listen(function(server) { //optional listen callback
   })
}
if ready is not defined, the server will start listening
@param closeCallback invoked when app is terminated, see app.stop()
*/
function startApp(ready, closeCallback) {
  var app = this;
  //app.startstack = new Error().stack;
  //set up clean shutdown on sigterm
  //see http://blog.argteam.com/coding/hardening-node-js-for-production-part-3-zero-downtime-deployments-with-nginx/
  //and https://github.com/visionmedia/express/issues/1366
  process.on( 'SIGTERM', function() {app.stop(closeCallback,true);});
  //XXX what about SIGINT (ctrl-c)? closeCallback needs to call process.exit(1) in that case
  var onready = function() {
    if (ready) {
       ready(function(listen) {
         app.server = app.listen(app.get('port'), 'localhost', function() {
           console.log('Express server listening on port %d', app.server.address().port);
           if (listen) listen(app.server);
         });
       });
    } else {
      app.server = app.listen(app.get('port'), 'localhost', function() {
        console.log('Express server listening on port %d', app.server.address().port);
      });
    }
  };

  var dburl  = app.get("dburl");
  mongoose.connect(dburl, function(err) {
    if (err)
      throw err;
    else
      console.log("connecting to database", dburl);

    // optionally apply data migrations in /updates folder before starting server.
    if(app.set('autoUpdates')) {
      console.log("checking for autoupdates to apply...");
      require('keystone').connect(mongoose); // need to do this for updates to work.
      var updates = require('keystone/lib/updates');
      updates.apply(function(){
        onready()
      });
    } else  {
      onready();
    }
  });
}

function getUrl() {
  if (!this.server)
    return null;
  var address = this.server.address();
  //XXX support https
  return util.format("http://%s:%d", address.address, address.port);
}

function createApp() {
  var app = express();
  var config = loadConfig('app')
  require('./config/passport')(passport); // pass passport for configuration

  // all environments
  app.set('views', path.join(__dirname, 'views'));
  app.engine('html', consolidate.swig);
  swig.setDefaults({ cache: false });
  app.set('view engine', 'html');

  //see http://blog.argteam.com/coding/hardening-node-js-for-production-part-3-zero-downtime-deployments-with-nginx/
  app.gracefullyExiting = false;
  app.use(function(req, res, next) {
    if (!app.gracefullyExiting)
      return next();
    res.setHeader ("Connection", "close")
    res.send (502, "Server is in the process of restarting. [stopApp]")
  });

  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  var cookiesecret = config.cookie_secret;
  if (!cookiesecret) {
    cookiesecret = crypto.randomBytes(64).toString('base64');
    console.log('no cookie_secret set in config/app.js, randomly choosing', cookiesecret);
  }
  app.use(express.cookieParser(cookiesecret));
  app.use(express.session(
    config.sessionfactory ?
      config.sessionfactory() : {
        store: new FileStore()
      }
  ));
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

  app.set('dburl', config.dburl);
  if (process.env.PORT || config.port)
    app.set('port', process.env.PORT || config.port);
  // using keystone's update.js, a data migration system: see
  //  http://keystonejs.com/docs/configuration/#updates
  app.set('autoUpdates', config.autoUpdates);
  app.start = startApp;
  app.stop = stopApp;
  app.getUrl = getUrl;
  return app;
}

module.exports = {
  dirname: __dirname,
  createApp: createApp,
}

// check to see if we're the main module (i.e. run directly, not require()'d)
if (require.main === module) {
  createApp().start();
}
