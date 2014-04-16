
var go = process.env.BROWSER_TESTS;

if(typeof(go !== 'undefined') && go === 'true'){
    
    var phantomTimeout = 10000;
    
    var exec = require('child_process').exec
    var fs   = require('fs');
    var path = require('path');
    var child = null;
    var assert = require('chai').assert;
    describe('---', function() {
        
        before(function() {
            console.log('\n\n----- in phantomjs ----------------------------');
            console.log("be sure ocdemo app is running with BROWSER_TESTS = true");
        });
        
        after(function() {
            console.log('----------------------------------\n\n');
        })
        
        
        fs.readdirSync('./test/public/tests').filter(function(file){
            // Only keep the .js files
            return file.substr(-3) === '.js';

        }).forEach(function(file){
            it(file, function(done) {
                this.timeout(phantomTimeout);
                var theLine = "mocha-phantomjs -R json http://localhost:3000/browsertest/" + file;
                // console.log(theLine);
                child = exec(theLine,
                  function (error, stdout, stderr) {
                      var msg = '';
                     // console.log("[error]", error, '[stdout]',stdout, '[stderr]',stderr);
                     var data = JSON.parse(stdout);
                     var stats = data.stats;
                     //console.dir(stats);
                     console.log("tests: " + stats.tests + " passes: " + stats.passes + 
                                " failures: " + stats.failures);
                     if(stats.failures > 0){
                         for(var i=0; i < data.failures.length; i++){
                             msg += "FAILURE: " + data.failures[i].fullTitle + '\n';
                         }
                     }
                     msg += stats.failures + " browser test(s) in " + file + " failed";
                     assert(stats.failures === 0, msg);
                    
                    done();
                });
                
            })

        });
        
             
    }); // describe ...


} // if(typeof(go !== 'undefined' && go === 'true')){
