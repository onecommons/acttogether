var main = require('../../app');
var express = require('express');
var mongoose = require('mongoose');

app = main.createApp();
app.use(express.static(main.dirname + '/test/public'));
var browsertest = require('../../routes/browsertest');
app.get('/browsertest/:testname', browsertest);

// create some  models we will need for testing.
mongoose.model('DbTest1',
  new mongoose.Schema({
    __t: String,
     _id: String,
    prop1: []
    },{strict: false}) //'throw'
);

module.exports = app;

// check to see if we're the main module (i.e. run directly, not require()'d)
if (require.main === module) {
  app.startApp(); 
}
