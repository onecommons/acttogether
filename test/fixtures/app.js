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

function createApp() {
  app = main.createApp();
  app.use(express.static(main.dirname + '/test/public'));
  var browsertest = require('../../routes/browsertest');
  app.get('/browsertest/:testname', browsertest);
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
  createApp().start(); 
}
