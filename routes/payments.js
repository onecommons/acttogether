// pay-balanced.js  route
var User               = require('../models/user');
var FI                 = require('../models/funding-instrument');
var Transaction        = require('../models/transaction');
var bp                 = require('../lib/oc-balanced');

// do a payment transaction with balanced API.
module.exports.setupPaymentPlan = function(req, res) {
       // NIY
       console.log("DATA RECEIVED", req.body);
       console.log("SESSION DATA", req.session);
       res.send("YOU SENT " + JSON.stringify(req.body));
}