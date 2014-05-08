// app/models/transaction.js

var mongoose                = require('mongoose');
var createModel             = require('../lib/createmodel');
var bp                      = require('../lib/oc-balanced');
var User                    = require('./user');
var FundingInstrument       = require('./funding-instrument');

// define the schema for our transaction model
var financialTransactionSchema = mongoose.Schema({
  status                   : { type: String, enum: ['prepare', 'succeeded', 'failed'], default: 'prepare'},
  user                     : { type: String, ref: 'User'},
  fi                       : { type: String, ref: 'FundingInstrument'}, 
  transactionType          : { type: String, 
                                enum: ['oneTimeDebit', 'paymentPlanDebit', 'credit'], 
                                default: 'paymentPlanDebit'},
  paymentProcessor         : { type: String, enum: ['balancedPayments', 'stripe', 'payPal'], default: 'balancedPayments' },
  date                     : Date,
  amount                   : { type: Number, max: 1500000, min: 100},
  currency                 : { type: String, default: 'USD' }, 
  appearsOnStatementAs     : { type: String, default: 'One Commons' },
  description              : { type: String, default: 'normal paymentPlan debit' }
});


// do an account debit using current settings of an FT. Callback is passed the 
// state of the saved FT record after the transaction is attempted or completed.
// Call this on a FT object, either pre-populated or to be populated with the options
// array, which can have entries for these field in the FT schema: 
//  user, fi, transactionType, paymentProcessor, amount, currency, appearsOnStatementAs, description.
//
// On return, date will be set and status will be 'succeeded' or 'failed'.
//
financialTransactionSchema.methods.doDebit = function(options, cb){

  theFT = this;

  for(key in options){
    if(theFT.hasOwnProperty(key)){
     theFT[key] = theFT[key] || options[key];
    }
  }

  var amount, description;

  theFT.date = new Date;

  // first, error returns:

  if( theFT.paymentProcessor !== 'balancedPayments'){
    theFT.status = 'failed';
    theFT.description = 'failed transaction: unsupported payment processor ' + theFT.paymentProcessor;
    theFT.save(cb(err,ftback));
    return;
  } 

  if( theFT.transactionType === 'credit') {
    theFT.status = 'failed';
    theFT.description = 'Credit transactions not yet supported'; 
    theFT.save(cb(err,ftback));
    return;
  }
  

  // OK, entering callback hell.

  User.findById(theFT.user
  ,function(err,u){
    if(err){ theFT.status = 'failed'; theFT.description = 'couldnt find user'; return }

    if(theFT.transactionType === 'paymentPlanDebit'){
      theFT.amount = theFT.user.paymentPlan.amount;
      theFT.fi = u.paymentPlan.fi;
    }

  FI.findById(theFT.fi
  ,function(err,fi){
    if(err){ theFT.status = 'failed'; theFT.description = 'couldnt find Funding Instrument'; return }

  bp.debitCard(theFT.fi.bp_token, theFT.amount, theFT.appearsOnStatementAs, theFT.description
  ,function(err, bp_reply){
      if(err){ theFT.status = 'failed'; theFT.description = "couldn't reach payment processor"; return }
      if(bp_reply.errors){ 
        theFT.status = 'failed';
        theFT.description = bp_reply.errors[0].description;
        return;
      } else {
        theFT.status = 'succeeded';
        theFT.description = bp_reply.debits[0].description;
      }

  }) }) });

  theFT.save(cb(err,ftback));

}




// expose model and schema to our app.

module.exports = createModel('FinancialTransaction', financialTransactionSchema);
