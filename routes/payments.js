// pay-balanced.js  route
var User               = require('../models/user');
var FI                 = require('../models/funding-instrument');
var Transaction        = require('../models/transaction');
var bp                 = require('../lib/oc-balanced');
var assert             = require('chai').assert;

// do a payment transaction with balanced API.
module.exports.setupPaymentPlan = function(req, res) {
       // NIY
       data = req.body;
       // console.log("DATA RECEIVED", req.body);

       var resultStatus = 'error';
       var resultMessage = 'nothing happened';

       // get user from session. for now, since sess dont work, we send user id with data sent in.
       var userId = data.userId;

       // validate fields.
       if( data.fundingInstrument.match(/\/cards\//) === null) {
        res.json({status: 'error', message: "bad funding instrument token"});
        return;
       }

       // validate min/max amount of transaction? 
       if(data.amount < bp.minAmount || data.amount > bp.maxAmount){
        res.json({status: 'error', message: "payment amount out of range: " + data.amount / 100.0 })
       }

       bp.debitCard(data.fundingInstrument, {data.amount}, function(err,data){
          if(err) {
            res.json({status:'error', message: 'payment attempt failed, bad FI'});
            return;
          }

          if(data.errors.length > 0) {
            res.json({status:'error', message: data.errors[0].status + ' ' + data.errors[0].description });
            // NIY save a failed payment transaction record.

            return;

          // payment succeeded, create fi, user pp,  succ tranasction record, and return success.

       //  else create fail transaction record, user PP with null fi, return fail.

       // 

       // console.log("SESSION DATA", req.session);
       res.setHeader('Content-Type', 'application/json');
       res.json({
          status: 'success',
          message: 'transaction successful 394293784929'
        });
}