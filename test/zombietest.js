var mongoose = require('mongoose');
var fs   = require('fs');
var path = require('path');
var assert = require('chai').assert;
var express = require('express');
var util = require('util');
var EventEmitter = require("events").EventEmitter;

var Browser = require("zombie");
describe('zombietest', function() {
  var app = require('./fixtures/app')();
  app.testresults = new EventEmitter();

  before(function(done) {
    app.set('views', __dirname + '/views');
    app.post('/testresult', function (req, res) {
      app.testresults.emit('clienttestresults', req.body);
      res.send( '"OK"', 200 );
    });

    app.start(function(listen) {
     mongoose.connection.db.dropCollection('dbtest1', function(err, result) {
        //may or may not exits, if it doesn't err will be set
        //console.log("dropCollection", err, result);
        listen(function(server) {
          done();
        });
      });
    });
  });

  after(function(done){ app.stop(done);})

  beforeEach(function(done) {
    app.testresults.removeAllListeners();
    done();
  });

  fs.readdirSync('./test/public/tests').filter(function(file){
      // Only keep the .js files
      return file.substr(-3) === '.js';

  }).forEach(function(file){

      it(file, function(done) {

        this.timeout(4000);
        var stats = null;
        var browser = new Browser({ debug: false, silent: true});
        browser.on("console", function(level, message) {
          console.log('from zombie browser console:', level, message);
        });
        app.testresults.once('clienttestresults', function(data) {
          stats = data.stats;
          console.log(file + " tests: " + stats.tests + " passes: " + stats.passes +
                    " failures: " + stats.failures);
          var msg = '';
          if(stats.failures > 0){
             for(var i=0; i < data.failures.length; i++){
                 msg += "FAILURE: " + data.failures[i].fullTitle + '\n';
             }
          }
          msg += stats.failures + " browser test(s) in " + file + " failed";
          assert(stats.failures === 0, msg);
        });

        var url = app.getUrl();
        assert(url);
        browser.visit(url+'/browsertest/'+file+'?xhr', function() {
          if (browser.errors.length)
            console.dir(browser.errors);
          assert(browser.errors.length == 0, "there are browser errors, see console");
          assert(stats);
          assert(stats.passes > 0);
          done();
        });
      });
  });

}); // describe ...
