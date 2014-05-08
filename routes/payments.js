// pay-balanced.js  route
var User                    = require('../models/user');
var FundingInstrument       = require('../models/funding-instrument');
var FinancialTransaction    = require('../models/financial-transaction');
var bp                      = require('../lib/oc-balanced');
var assert                  = require('chai').assert;

// setup users payment plan and do a payment transaction with balanced API.
module.exports.setupPaymentPlanPost = function(req, res) {
       // NIY

       // console.log("in setupPaymentPlanPost user = ", req.user);

       var data = req.body;
       // console.log("DATA RECEIVED", req.body);

       var resultStatus = 'error';
       var resultMessage = 'nothing happened';

       // get user from session. for now, since this dont work, we use our generic test user 0.
       var theUser =  { _id: "@User@0" };

       // validate fields.
       if( data.fundingInstrument.match(/\/cards\//) === null) {
        res.json({status: 'error', message: "bad funding instrument token"});
        return;
       }

       // validate min/max amount of transaction? 
       if(data.donationAmount < bp.minAmount || data.donationAmount > bp.maxAmount){
        res.json({status: 'error', message: "payment amount out of range: " + data.amount / 100.0 })
       }

       /* entering 5-deep callback waterfall!!! */
       bp.debitCard(data.fundingInstrument, {amount: data.donationAmount }
         ,function(err,bp_reply){

            var now = new Date;

            if(err) {
              res.json({status:'error', message: 'payment attempt failed, bad FI'});
              return;
            }

            // no err, but there still could be a transaction failure. If so, record it and return.
            if(data.errors) {
              var fft = new FinancialTransaction();
              fft.status = 'fail';
              fft.user = theUser._id;
              fft.date = now;
              fft.amount = data.donationAmount;
              fft.description = data.errors[0].status +
                             ' ' + data.errors[0].description;
              fft.save();
              res.json({status:'error', 
                    message: fft.description });
              return;
            }

            // If we got here, payment succeeded: 
            // Create FI, edit user payment plan, create a success FT record, and return success.

            var fi          = new FundingInstrument();
            fi.user         = data.userId;
            fi.cclastfour   = data.cclastfour;
            fi.type         = 'cc';
            fi.cctype       = data.cctype;
            fi.name_on_card = data.ccname;
            fi.cctype       = data.cctype;
            fi.ccexp        = data.ccexp;
            fi.bp_token     = data.fundingInstrument;

          fi.save(
          function(err, fiback){
            fi._id = fiback._id;

            // setup users payment plan.
          User.findOne({_id: theUser._id}
          ,function(err,u){
              u.payplan =  {
                      frequency: data.donationFrequency, 
                      lastCharge: now,
                      fi: fi._id
              };

          u.save(
          function(err, uback){
            // save financial transaction
            var bpdata = bp_reply.debits[0];
            ft = new FinancialTransaction();
            ft.status = 'success';
            ft.user = theUser._id;
            ft.transactionType = 'paymentPlan';
            ft.fi = fi._id;
            ft.date = now;
            ft.amount = bpdata.amount;
            ft.currency = bpdata.currency;
            ft.transactionNumber = bpdata.transaction_number;
            ft.appearsOnStatementAs = bpdata.appears_on_statement_as;
            ft.description  = bpdata.description;

          ft.save(
          function(err, ftback){
            // send response.
            res.json({
              status: 'success',
              message: 'transaction Number ' + bp_reply.debits[0].transaction_number + ' succeeded.'
            });

      }) }) }) }) }); // bp.debitCard(function(){ ... 

} // module.exports.setupPaymentPlanPost