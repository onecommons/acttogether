// app/models/transaction.js

var mongoose = require('mongoose');
var createModel = require('../lib/createmodel');

// define the schema for our item model
var FundingInstrumentSchema = mongoose.Schema({
  user             : { type: String, ref: 'User'},
  type             : { type: String, enum: ['cc', 'ach', 'paypal']},
  cclastfour       : String,
  cctype           : {type: String, enum:
                       ["amex", "discover","mastercard","visa","diners-club","jcb",'' ]},
  name_on_card     : String,
  bp_token         : String
});

// expose model and schema to our app.

module.exports = createModel('FundingInstrument', FundingInstrumentSchema);
