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
  date                     : { type: Date, default: Date.now },
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

// utility last thing to do no matter what path we take through the callbacks in doDebit():
// save the financial transaction, the updated user (if changed) and call the callback.

// financialTransactionSchema.methods.errExit = function(ft, user, cb) {
//   ft.save(function(err, ftback){
//     console.log('cb = ',cb, 'ft= ', ft);
//     cb(null, ft);
//   //  if(user !== null ) { user.save(cb(null, ft)) }
//   //  else { cb(null, ft) }
//   })
// }


financialTransactionSchema.methods.doDebit = function(options, callback){

  theFT = this;
  var theUser, theFI;
  var amount, description, theBPToken;

  function errExit(ft,user,cb, err1){
    ft.save(function(err, ftback){
     if(false /*user != null */ ) { user.save(cb(err1, ft)) }
     else { cb(err1, ft) }
    })
  }

  function successExit(ft,user,cb){
    ft.save(function(err, ftback){
      if(err){ throw new Error("couldnt save FT"); }
      user.paymentPlan.lastCharge = ftback._id;
      user.save(cb(null, ftback));
    });
  }


  for(key in options){
     theFT[key] = options[key];
  }


  theFT.date = new Date;
  // first, easy synchronous error returns:

  if( theFT.paymentProcessor !== 'balancedPayments'){
    theFT.status = 'failed';
    theFT.description = 'failed transaction: unsupported payment processor ' + theFT.paymentProcessor;
    errExit(theFT, null, callback, new Error(theFT.description));
    return;
  } 

  if( theFT.transactionType === 'credit') {
    theFT.status = 'failed';
    theFT.description = 'Credit transactions not yet supported'; 
    errExit(theFT, null, callback, new Error(theFT.description));
    return;
  }
  

  // // OK, entering callback chain.

  User.findById(theFT.user, function(err,u){
    if(!u){ 
      theFT.status = 'failed'; theFT.description = 'couldnt find user'; 
      errExit(theFT, theUser, callback, new Error(theFT.description));
      return;
    }

    theUser = u;

    
    if(theFT.transactionType === 'paymentPlanDebit'){
      theFT.amount = theUser.paymentPlan.amount;
      theFT.fi = theUser.paymentPlan.fi;
    }
    
    
    FundingInstrument.findById(theFT.fi, function(err,fi){
      if(!fi || !theFT){ 
        theFT.status = 'failed'; theFT.description = 'couldnt find Funding Instrument'; 
        errExit(theFT, theUser, callback, new Error(theFT.description) );
        return;
      }

      theFI = fi;
      theBPToken = theFI.bp_token;

      bp.debitCard(theBPToken, 
        { amount: theFT.amount, 
          appears_on_statements_as: 
          theFT.appearsOnStatementAs, 
          description: theFT.description}, 
            function(err, bp_reply){

              if(err){ 
                theFT.status = 'failed'; theFT.description = "couldn't reach payment processor";
                theFT.errExit(theFT, theUser, callback, new Error(theFT.description));  
                return;

              } 

              if (bp_reply.errors){ 
                theFT.status = 'failed';
                theFT.description = bp_reply.errors[0].description;
                errExit(theFT, null, callback, new Error(theFT.description));
                return;

              } 

              // else success!
              theFT.status = 'succeeded';
              theFT.description = bp_reply.debits[0].description;
              theUser.paymentPlan.lastCharge = theFT._id;
              successExit(theFT, theUser, callback);
              return;
      }) }) })

}

/*
financialTransactionSchema.methods.doDebitQ = function(options){

  theFT = this;
  var theUser, theFI;
  var amount, description, theBPToken;


  // update values in this FT with options.
  for(key in options){
     theFT[key] = options[key];
  }

  theFT.date = new Date;
  // first, easy synchronous error returns:

  /* 
  if( theFT.paymentProcessor !== 'balancedPayments'){
    theFT.status = 'failed';
    theFT.description = 'failed transaction: unsupported payment processor ' + theFT.paymentProcessor;
    errExit(theFT, null, callback, new Error(theFT.description));
    return;
  } 

  if( theFT.transactionType === 'credit') {
    theFT.status = 'failed';
    theFT.description = 'Credit transactions not yet supported'; 
    errExit(theFT, null, callback, new Error(theFT.description));
    return;
  }
  

  // // OK, entering callback chain.

  User
    .findOne({_id: theFT.user})
    .exec()
    .then(
      function(u){ 
        if(!u){
          throw new Error('user not found');
        } else {
          console.log("USER FOUND u = ", u);
          theUser = u;
          return theFT }

      })
    .then(null,function(err){console.log("rejected"); return err; })
    .then(function(theFT){return theFT; });

    // .then(function(){
    //   if(theFT.transactionType === 'paymentPlanDebit'){
    //     theFT.amount = theUser.paymentPlan.amount;
    //     theFT.fi = theUser.paymentPlan.fi;
    //   }
    //   FundingInstrument
    //     .findByID(theFT.fi)
    //     .exec()
    //     .then(function(fi){
    //       theFI = fi;
    //       theBPToken = theFI.BPToken;
    //     }, function(err) { return new Error('FI not found')})


    /*
  User.findById(theFT.user, function(err,u){
    if(!u){ 
      theFT.status = 'failed'; theFT.description = 'couldnt find user'; 
      errExit(theFT, theUser, callback, new Error(theFT.description));
      return;
    }

    theUser = u;

    
    if(theFT.transactionType === 'paymentPlanDebit'){
      theFT.amount = theUser.paymentPlan.amount;
      theFT.fi = theUser.paymentPlan.fi;
    }
    
    
    FundingInstrument.findById(theFT.fi, function(err,fi){
      if(!fi || !theFT){ 
        theFT.status = 'failed'; theFT.description = 'couldnt find Funding Instrument'; 
        errExit(theFT, theUser, callback, new Error(theFT.description) );
        return;
      }

      theFI = fi;
      theBPToken = theFI.bp_token;

      bp.debitCard(theBPToken, 
        { amount: theFT.amount, 
          appears_on_statements_as: 
          theFT.appearsOnStatementAs, 
          description: theFT.description}, 
            function(err, bp_reply){

              if(err){ 
                theFT.status = 'failed'; theFT.description = "couldn't reach payment processor";
                theFT.errExit(theFT, theUser, callback, new Error(theFT.description));  
                return;

              } 

              if (bp_reply.errors){ 
                theFT.status = 'failed';
                theFT.description = bp_reply.errors[0].description;
                errExit(theFT, null, callback, new Error(theFT.description));
                return;

              } 

              // else success!
              theFT.status = 'succeeded';
              theFT.description = bp_reply.debits[0].description;
              theUser.paymentPlan.lastCharge = theFT._id;
              errExit(theFT, theUser, callback, null);
              return;
      }) }) })


} // doDebitQ()
*/



// expose model and schema to our app.

module.exports = createModel('FinancialTransaction', financialTransactionSchema);
