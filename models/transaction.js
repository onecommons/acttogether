// app/models/transaction.js

var mongoose = require('mongoose');
var createModel = require('../lib/createmodel');

// define the schema for our item model
var TransactionSchema = mongoose.Schema({
    // NIY
    // creator : {type: String, ref: "User"},
    // creationDate : { type: Date, default: Date.now}, 
    // modDate : {type: Date, default: Date.now},
    // parent: { type: String, ref: 'Item'},
    // title: String,
    // content: String
});

// expose model and schema to our app.

module.exports = createModel('Transaction', TransactionSchema);
