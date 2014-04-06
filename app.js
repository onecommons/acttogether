/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var swig = require('swig');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var app = express();

// passport, mongodb configuration
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
require('./config/passport')(passport); // pass passport for configuration

// all environments
app.set('port', process.env.PORT || 3000);

app.set('views', path.join(__dirname, 'views'));
app.engine('html', swig.renderFile);
swig.setDefaults({ cache: false });
app.set('view engine', 'html');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here')); //XXX
app.use(express.session());

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
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

http.createServer(app).listen(app.get('port'), 'localhost', function(){
  console.log('Express server listening on port ' + app.get('port'));
});
