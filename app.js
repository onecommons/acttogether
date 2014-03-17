
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

// configuration
var configDB = require('./config/database.js');
mongoose.connect(configDB.url); // connect to our database
require('./config/passport')(passport); // pass passport for configuration

var app = express();

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
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash()); // use connect-flash for flash messages stored in session


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//
// routes
//
app.get( '/', routes.index);
app.get( '/about/:pagename', routes.dispatch);


http.createServer(app).listen(app.get('port'), 'localhost', function(){
  console.log('Express server listening on port ' + app.get('port'));
});
