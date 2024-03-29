var main = require('../../app'),
 express = require('express'),
 mongoose = require('mongoose')

// create some  models we will need for testing.
mongoose.model('DbTest1',
  new mongoose.Schema({
    __t: String,
     _id: String,
    prop1: []
    },{strict: false}) //'throw'
);


function addBrowserTests() {
  this.set('views', __dirname + '/../views');
  this.get('/browsertest/:testname', function(req, res) {
      res.render('browsertest.html', { 
          testName: req.params.testname
      })
  });
}

function createApp() {
  app = main.createApp();
  app.use(express.static(main.dirname + '/test/public'));
  app.addBrowserTests = addBrowserTests;
  return app;
}
module.exports = createApp;

/* XXX
function() {
  var mocha = require('mocha');
  mocha.before(function(done) {app.start(
    function(listen){listen(); done();};
  });
  mocha.after(function(done) {app.stop(done)});
}
*/

// check to see if we're the main module (i.e. run directly, not require()'d)
if (require.main === module) {
  var app = createApp();
  app.addBrowserTests();
  app.start();
}
