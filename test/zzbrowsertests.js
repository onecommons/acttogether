
// zzbrowsertests.js: this is a "test" that invokes one by one the full suite of browser-side tests in test/public/tests using phantomjs.
// Why 'zz'?  To make it run last!

var go = process.env.BROWSER_TEST;

if (go) {
    var mongoose = require('mongoose');
    var exec = require('child_process').exec
    var fs   = require('fs');
    var path = require('path');
    var assert = require('chai').assert;
    var express = require('express');
    var main = require('app');

    var phantomTimeout = 10000;
    var child = null;
    var app = null;

    describe('---', function() {

        before(function() {
            console.log("*** Creating an app instance....");
            app = main.createApp();

            // configure code moved from app.js
            app.set('port', process.env.PORT || 3000);

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
            mongoose.connect(configDB.url); // connect to our database

            console.log("Browser-based test routes added");
            app.use(express.static(main.dirname + '/test/public'));

            console.log("*** starting app instance");
            main.startApp(app);
        });

        after(function() {
            console.log('----------------------------------\n\n');
            console.log("*** need to shut down running app instance somehow?");
        })

        fs.readdirSync('./test/public/tests').filter(function(file){
            // Only keep the .js files
            return file.substr(-3) === '.js';

        }).forEach(function(file){
            it(file, function(done) {

                var db;

                mongoose.disconnect(function() {
                    db = mongoose.connect('mongodb://localhost/ocdemo-unittest');
                });

                this.timeout(phantomTimeout);
                var execLine = "mocha-phantomjs -R json http://localhost:3000/browsertest/" + file;
                // console.log(execLine);
                child = exec(execLine,
                  function (error, stdout, stderr) {

                     // report on results.
                     var msg = '';
                     // console.log("[error]", error, '[stdout]',stdout, '[stderr]',stderr);
                     var data = JSON.parse(stdout);
                     var stats = data.stats;
                     // console.dir(stats);
                     console.log(file + " tests: " + stats.tests + " passes: " + stats.passes +
                                " failures: " + stats.failures);
                     if(stats.failures > 0){
                         for(var i=0; i < data.failures.length; i++){
                             msg += "FAILURE: " + data.failures[i].fullTitle + '\n';
                         }
                     }
                     msg += stats.failures + " browser test(s) in " + file + " failed";
                     assert(stats.failures === 0, msg);

                     done();
                    /*
                    db.connection.db.dropDatabase(function(){
                      db.connection.close(function(){
                         done();
                      });
                    });
                    */
                });

            })

        });


    }); // describe ...

} // if(typeof(go !== 'undefined' && go === 'true')){
