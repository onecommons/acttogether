
// zzbrowsertests.js: this is a "test" that invokes one by one the full suite of browser-side tests in test/public/tests using phantomjs.
// Why 'zz'?  To make it run last!

var go = process.env.BROWSER_TEST;

if(go){

    var phantomTimeout = 10000;

    var mongoose = require('mongoose');

    var exec = require('child_process').exec
    var fs   = require('fs');
    var path = require('path');
    var child = null;
    var assert = require('chai').assert;
    describe('---', function() {

        before(function() {
            console.log('\n\n----- in phantomjs ----------------------------');
            console.log("be sure ocdemo app is running with BROWSER_TEST=1");
        });

        after(function() {
            console.log('----------------------------------\n\n');
        })


        fs.readdirSync('./test/public/tests').filter(function(file){
            // Only keep the .js files
            return file.substr(-3) === '.js';

        }).forEach(function(file){
            it(file, function(done) {

                var db;

                mongoose.disconnect(function() {
                    db = mongoose.connect('mongodb://localhost/test');
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
