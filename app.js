/**
 * Module dependencies.
 */

// DON'T DO THIS HERE.. hacky time. 

var Item = require('./models/item');
var Post = require('./models/post');
var Comment = require('./models/comment');


var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var consolidate = require('consolidate');
var swig = require('swig');
require('./lib/swigextensions')(swig);
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var util = require('util');

var app = express();

// passport, mongodb configuration
if(process.env.BROWSER_TEST){

    // doing browser tests: set up db, make a few models we will need.
    console.log('env = ', app.get('env'));
    var defaultDbUrl = "mongodb://127.0.0.1:27017/test";
    console.log("WARNING: test mode,using db ", defaultDbUrl);
    configDB = {url: defaultDbUrl}

    // create some  models we will need for testing.
    mongoose.model('DbTest1', 
      new mongoose.Schema({
        __t: String,
         _id: String,
        prop1: []
        },{strict: false}) //'throw'
    );
    
} else {
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
}

mongoose.connect(configDB.url); // connect to our database
require('./config/passport')(passport); // pass passport for configuration

// all environments
app.set('port', process.env.PORT || 3000);

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

// test only.
if( process.env.BROWSER_TEST){
    console.log("Browser-based test routes added")
    app.use(express.static(__dirname + '/test/public'));
}


// development only g
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

http.createServer(app).listen(app.get('port'), 'localhost', function(){
  console.log('Express server listening on port ' + app.get('port'));
});

 


