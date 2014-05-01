// payment.js  route
// var User            = require('../models/user');
// var FI              = require('../models/funding-instrument');
// var Transaction     = require('../models/transaction');
var balanced        = require('balanced-official');

// do a payment transaction with balanced API.
module.exports = function(req, res) {
       // NIY
       console.log("DATA RECEIVED", req.body);
       res.send("YOU SENT " + JSON.stringify(req.body));
}