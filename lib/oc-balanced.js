//
// oc-balanced.js  – our own little interface to features of balanced payments that we are using.
//

var httpRequest     = require('request');

var apiKey = 'ak-test-eyoGATiAg6YE5thvhSiWIi7NE0zg0l0U'; // for now test
var baseUrl = "https://api.balancedpayments.com";


// for debitCard, params must include amount (in cents) and "appears_on_statement_as" fields 
//  callback args are err, returned-data in json.
var debitCard = function(card_token, params, cb) {
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
