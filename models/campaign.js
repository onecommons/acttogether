// app/models/campaign.js
// load the things we need
var mongoose = require('mongoose');
var createModel = require('../lib/createmodel');

// define the schema for our campaign model.
//  HAS MANY Subscriptions.
var campaignSchema = mongoose.Schema({

    fund              : {type: String, ref 'Fund'}
    name              : String,
});


// create the model for users and expose it to our app
module.exports = createModel('Campaign', campaignSchema);
