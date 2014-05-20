// pay-balanced.js  route
var User                    = require('../models/user');
var FundingInstrument       = require('../models/funding-instrument');
var FinancialTransaction    = require('../models/financial-transaction');
var bp                      = require('../lib/oc-balanced');
var u                       = require('../lib/utils');
var async                   = require('async');

// DBG_ON = true;

/*
 * fundCampaign() – JSON POST handler. 
 * ----------------------------------
 *  Expected data sent:
 *   amount           – REQUIRED - in USD cents, by default.
 *   currency         - OPTIONAL - if absent USD assumed. 
 *   campaignId       - OPTIONAL - recipient campaign id; if absent assume the default One Commons campaign.
 *   frequency        - OPTIONAL - same as enum of subscription frequency; default = 'once'
 * 
 * following fields should either ALL be included or ALL be absent:
 *   ccToken          - OPTIONAL - card token; if absent, assumes user has a valid FundingInstrument; if not, FAIL.
 *   ccLastFour       - OPTIONAL - card info
 *   ccNameOnCard     - OPTIONAL - 
 *   ccCVV            - OPTIONAL - nnn 3 digit cvv code.
 *   ccExpirationDate - OPTIONAL - mmyy
 *   cctype           - OPTIONAL - one of ["amex", "discover","mastercard","visa","diners-club","jcb",'']
 * ------------------------------------
 * 
 * will respond with a JSON object with:
 *  status: ['noFI', 'succeeded', 'failed']
 *  comment:  – reason for failure, if any.
 *  
 */
module.exports.fundCampaign = function(req,res, user){
  // check args: amount provided? if not  ret failed / 'amount unspecified'
  var data = req.body;
  var locals = {};
  locals.theUser = (req.user ? req.user : user);

  if(typeof(data.amount) === 'undefined'){
    res.json({status: 'failed', comment: 'no amount provided'});
    return;
  }

  locals.theCampaignId = (data.campaignId ? data.campaignId : '@Campaign@0');

  var setupFI = function(done){
    if(typeof(data.ccToken) === 'undefined') {
      // retrieve the user FI.
      FundingInstrument.findOne({_id: locals.theUser.fi}, 
        function(err, fiback){
          if(err || !fiback) { res.json({status: 'noFI', comment: 'user has no funding instrument'}); done(); return }
          locals.fi = fiback;
          if(data.frequency != locals.fi.frequency){
            locals.fi.frequency = data.frequency;
            locals.fi.save(done);
          } else { done()}
        });
    } else {
      // no fi exists, and data has been submitted to create a FI and tie to user.
      locals.fi                        = new FundingInstrument();
      locals.fi.user                   = locals.theUser._id;
      locals.fi.ccLastFour             = data.ccLastFour;
      locals.fi.ccType                 = data.ccType;
      locals.fi.ccNameOnCard           = data.ccNameOnCard;
      locals.fi.ccToken                = data.ccToken;
      locals.fi.ccExpirationDate       = data.ccExpirationDate;
      locals.fi.ccCVV                  = data.ccCVV;
      locals.fi.save(function(err, fiback){
        if(err || !fiback) { res.json({status: 'failed', comment: 'funding instrument creation failed'}); done(); return }
        locals.fi = fiback;
        done();
      });
    }
  } // var setupFI()

  var setupSubscription = function(done){
    Subscription.findOne({user: locals.theUser.id, campaign: locals.theCampaignId },
      function(err,subBack1){
        if(err) { res.json({status: 'failed', comment: 'error finding subscription'}); done(); return }
        if(!subBack1){
          // create a new subscription and save it.
          locals.sub = new Subscription();
          locals.sub.user = locals.theUser.id;
          locals.sub.campaign = locals.theCampaignId;
          locals.sub.save(function(err,subBack2){
            if(err){ res.json({status: 'failed', comment: 'error creating subscription'}); done(); return }
            locals.sub = subBack2;
            done();
          })
        } else {
          locals.sub = subBack1;
          done()
        }
      })
  } // var setupSubscription()


  var setupFT = function(done){
    // setup FT to define transaction.
    locals.FT               = new FinancialTransaction();
    locals.FT.subscription  = locals.sub;
    locals.FT.fi            = locals.fi;
    locals.FT.amount        = data.amount;
    locals.FT.currency      = (data.amount ? data.amount : locals.FT.currency);
    locals.FT.campaign      = data.campaignId;

    done();
  }

  async.series([ setupFI, setupSubscription, setupFT], 
    function(done){
    
    // actually do transaction. NIY TODO TRP

    // TODO TRP: make this real. For now, declare success at this point, and return success code.
    res.json({status: 'succeeded', comment: 'fake result, no transaction actually happened!'})

    });


} // fundCampaign()

// setup users payment plan and do a payment transaction with balanced API.
// optional 3rd 'user' arg is used in testing, set up when route is defined.
module.exports.setupPaymentPlanPost = function(req, res, user) {
  
       var data = req.body;

       var resultStatus = 'error';
       var resultMessage = 'nothing happened';

       var theUser =  (req.user ? req.user : user); // optional user passed while testing, in prod will be undefined.

       u.dbg('theUsers', [theUser, req.user, user]);

       // validate fields.
       if( data.fundingInstrument.match(/\/cards\//) === null) {
        res.json({status: 'error', message: "bad funding instrument token, no transaction attempted."});
        done(); return;
       }

       // validate min/max amount of transaction? 
       if(data.donationAmount < bp.minAmount || data.donationAmount > bp.maxAmount){
        res.json({status: 'error', message: "no transaction attempted, payment amount out of range: " + data.amount / 100.0 })
       }

       /* entering 5-deep callback waterfall!!! */
       bp.debitCard(data.fundingInstrument, {amount: data.donationAmount }
         ,function(err,bp_reply){
            var now = new Date;

            if(err) {
              res.json({status:'error', 
                  message: "error done(); returned from balanced payments",
                  bp_reply: bp_reply });
              done(); return;
            }

            u.dbg('bp_reply', bp_reply);
            // no err, but there still could be a transaction failure. If so, record it and done(); return.
            if(bp_reply.errors) {
              var fft = new FinancialTransaction();
              fft.status = 'fail';
              fft.user = theUser._id;
              fft.date = now;
              fft.amount = data.donationAmount;
              fft.description = bp_reply.errors[0].status +
                             ' ' + bp_reply.errors[0].description;
              fft.save(
              function(){
                res.json({status: bp_reply.errors[0].status,
                    message: bp_reply.errors[0].description,
                    bp_reply: bp_reply });
              });
              done(); return;
            }

            // If we got here, payment succeeded: 
            // Create FI, edit user payment plan, create a success FT record, and done(); return success.

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
              ,function(err,uFound){
                if(err) { throw err }
                uFound.paymentPlan =  {
                        frequency: data.donationFrequency, 
                        lastCharge: now,
                        fi: fi._id
                };

                uFound.save(
                function(err, uback){
                  if(err) { throw err }
                  // save financial transaction
                  var bpdata = bp_reply.debits[0];
                  ft = new FinancialTransaction();
                  ft.status = 'succeeded';
                  ft.user = theUser._id;
                  ft.transactionType = 'subscriptionDebit'; // default value.
                  ft.fi = fi._id;
                  ft.date = now;
                  ft.amount = bpdata.amount;
                  ft.currency = bpdata.currency;
                  ft.transactionNumber = bpdata.transaction_number;
                  ft.appearsOnStatementAs = bpdata.appears_on_statement_as;
                  ft.description  = bpdata.description;

                  u.dbg('defined ft', ft);
                  ft.save(
                  function(err, ftback){
                    if(err) { throw err }
                    u.dbg('saved ft', ftback);
                    // send response.
                    res.json({
                      status: bp_reply.debits[0].status,
                      message: 'transaction Number ' + bp_reply.debits[0].transaction_number + ' ' + bp_reply.debits[0].description,
                      bp_reply: '[omitted]' // bp_reply
                    });

      }) }) }) }) }); // bp.debitCard(function(){ ... 

} // module.exports.setupPaymentPlanPost