// app/models/transaction.js

var mongoose = require('mongoose');
var createModel = require('../lib/createmodel');

// define the schema for our transaction model
var FinancialTransactionSchema = mongoose.Schema({
  status                   : {type: String, enum: ['success', 'fail']},
  user                     : { type: String, ref: 'User'},
  fi                       : { type: String, ref: 'FundingInstrument'},
  date                     : Date,
  amount                   : Number,
  currency                 : String,
  transactionNumber        : String,
  appearsOnStatementAs     : String,
  description              : String
});

// expose model and schema to our app.

module.exports = createModel('FinancialTransaction', FinancialTransactionSchema);
