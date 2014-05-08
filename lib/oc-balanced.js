//
// oc-balanced.js  – our own little interface to features of balanced payments that we are using.
//

ft = require('../models/financial-transaction.js');

var httpRequest     = require('request');

var apiKey = 'ak-test-eyoGATiAg6YE5thvhSiWIi7NE0zg0l0U'; // for now,  test key
var baseUrl = "https://api.balancedpayments.com";
var defaultStatementText = "One Commons";
var defaultDescription = "Periodic user payment";
var minAmount = 100;  // $1
var maxAmount = 1500000; // bp max is $15,000


// for debitCard, params must include amount (in cents) and "appears_on_statement_as" fields;
//   optionally include 'description' field used in balanced payments dashboard.
//  callback args are err, returned-data in json.
var debitCard = function(card_token, params, cb) {
     params.appears_on_statement_as = params.appears_on_statement_as || defaultStatementText;
     params.description = params.description || defaultDescription;
     var reqSettings = {
          url:  baseUrl + card_token + '/debits',
          auth: { user: apiKey, pass: '', sendImmediately: true },
          json: params
      }
      httpRequest.post(reqSettings, function(err, res, body){ 
          cb(err, body);
      });
}

var setApiKey = function(apiKeyIn){ apiKey = apiKeyIn; }

module.exports.debitCard = debitCard;
module.exports.setApiKey = setApiKey;
module.exports.minAmount = minAmount;
module.exports.maxAmount = maxAmount;
