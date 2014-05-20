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

/*
@ready callback called after server is initialized, e.g. after it connects to database.
@param listen
if a boolean, specifies whether to listen or not
if a function, used as callback by app.listen with the server as the first arguement
default: true
*/
function startApp(readyCallback, listen) {
  var app = this;
  if (typeof listen == 'undefined') {
    listen = true;
  }
  if (listen) {
    if (typeof listen != 'function') {
      listen = function(server) { //use a default listen callback
          console.log('Express server listening on port %d', server.address().port);
      };
    }
  }

  var onready = function (err) {
    if (listen) {
      var server = app.listen(app.get('port'), 'localhost', function() { 
        if (readyCallback)
          readyCallback(err);
        listen(server); 
      });
    } else if (readyCallback) {
      readyCallback(err);
    }
  };

  var dburl  = app.get("dburl");
  mongoose.connect(dburl, function(err) {
    if (err) //ignore error
      console.log('WARNING: error while opening db at', dburl, err);
    else
      console.log("connecting to database", dburl);

    // optionally apply data migrations in /updates folder before starting server.
    if(app.set('autoUpdates')) {
      console.log("checking for autoupdates to apply...");
      require('keystone').connect(mongoose); // need to do this for updates to work.
      var updates = require('keystone/lib/updates');

      updates.apply(function(){
        onready(err)
      });
    } else  {
      onready(err);
    }
  });  
}

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

  var config = loadConfig('app')
  app.set('dburl', config.dburl);
  if (process.env.PORT || config.port)
    app.set('port', process.env.PORT || config.port);
  // using keystone's update.js, a data migration system: see
  //  http://keystonejs.com/docs/configuration/#updates
  app.set('autoUpdates', config.autoUpdates);
  app.startApp = startApp;
  return app;
}

module.exports = {
  dirname: __dirname,
  createApp: createApp,
}

// check to see if we're the main module (i.e. run directly, not require()'d)
if (require.main === module) {
  createApp().startApp();
}
