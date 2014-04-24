// browsertest.js  route

var swig      = require('swig');
var fs        = require('fs');
var getVars   = require('../lib/utils').getVars;

module.exports = function(app){

// add route for browser-side testing, specifying a unitname.
    // testname may be specified in URL with a ?testname=basetestname param;
    // if none present, testname is assumed to be unitname-test
    //
    if( process.env.BROWSER_TEST){
        app.get('/browsertest/:testname', function(req, res) {
            res.render('browsertest.html', getVars({ // trp test will be browsertestframe.html
                testName: req.params.testname}));
            });
    }


}