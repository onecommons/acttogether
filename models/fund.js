// app/models/fund.js

// load the things we need
var createModel = require('../lib/createmodel');

// Recipient is an organization, or ultimate depository of funds.
// HAS_MANY Campaigns.
var fundSchema = mongoose.Schema({

    recipient         : {type: String } 
    name              : String
    // account? eventually ?
});


// create the model for users and expose it to our app
module.exports = createModel('Fund', fundSchema);
