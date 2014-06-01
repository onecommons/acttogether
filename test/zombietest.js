var mongoose = require('mongoose');
var fs   = require('fs');
var path = require('path');
var assert = require('chai').assert;
var express = require('express');
var util = require('util');

var Browser = require("zombie");
var phantomTimeout = 10000;

describe('zombietest', function() {
  var app = require('./fixtures/app')();
  
  before(function(done) {  
    app.start(function(listen) {
      listen(function(server) { 
        done();
      });
    });
  });

  after(function(done){ app.stop(done);})

  fs.readdirSync('./test/public/tests').filter(function(file){
      // Only keep the .js files
      return file.substr(-3) === '.js';

  }).forEach(function(file){
      it(file, function(done) {
        
        this.timeout(phantomTimeout);
        var stats = null;
        var browser = new Browser({ debug: false, silent: true});
        browser.on("console", function(level, message) {
          //console.log('browser console', level, message);
          if (level == 'error') return;
          var data = JSON.parse(message);
          stats = data.stats;
          //console.dir(stats);
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
        browser.visit(url+'/browsertest/'+file, function() {
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
