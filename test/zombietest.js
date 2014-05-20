var mongoose = require('mongoose');
var fs   = require('fs');
var path = require('path');
var assert = require('chai').assert;
var express = require('express');
var util = require('util');

var Browser = require("zombie");
var phantomTimeout = 10000;
var testserver = null;

describe('zombietest', function() {

  before(function(done) {
    var app = require('./fixtures/app');
    app.startApp(null, function(server) { 
      console.log('test app started on', server.address()); 
      testserver = server; 
      done();
    });
  });

  fs.readdirSync('./test/public/tests').filter(function(file){
      // Only keep the .js files
      return file.substr(-3) === '.js';

  }).forEach(function(file){
      it(file, function(done) {
        
        
        this.timeout(phantomTimeout);
        var browser = new Browser({ debug: false, silent: true});
        browser.on("console", function(level, message) {
          //console.log('browser console', level, message);
          if (level == 'error') return;
          var data = JSON.parse(message);
          var stats = data.stats;
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
        var address = testserver.address();
        var url = util.format("http://%s:%d/browsertest/%s", address.address, address.port, file);
        browser.visit(url, function() {
          if (browser.errors && browser.errors.length)
            console.dir("Errors reported:", browser.errors);
          done();
        });
      });
  });

}); // describe ...
