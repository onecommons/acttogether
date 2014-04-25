// browsertest.js  route
var getVars   = require('../lib/utils').getVars;

// add route for browser-side testing, specifying a unitname.
// testname may be specified in URL with a ?testname=basetestname param;
// if none present, testname is assumed to be unitname-test

module.exports = function(req, res) {
    res.render('browsertest.html', getVars({ // trp test will be browsertestframe.html
        testName: req.params.testname
    }));
}