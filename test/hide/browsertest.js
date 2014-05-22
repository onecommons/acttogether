var BROWSER = '';
var KEEPOPEN = false;

var open = require("./scripts/open"); //see https://github.com/pwnall/node-open
var exec = require('child_process').exec

  var child = null; 
  function after() {
     if (!child) return 

    if (!KEEPOPEN) {
       child.kill()
    } else {
        //would like to prevent test from timing out so that the server launch runs indefinately haven't looked how to do that
    }
         
  } 

function openurl(url, browser) {
  if (browser == 'phantomjs') 
    return exec('phantomjs phantomjs.coffee '+ url.replace(/"/g, '\\\"'));
 else 
   return open(url, browser);
}

it('should work', function(done) {
   url ="test.html";
   child = openurl(url, BROWSER);
   app.post('/results', function (req, res, next) {
       var testResults = req.body; 
       testResults['passed'].should.equal.testResults['total'];
       done();
   });

});