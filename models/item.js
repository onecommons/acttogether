// app/models/item.js

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var createModel = require('../lib/createmodel');

// define the schema for our item model
var itemSchema = mongoose.Schema({
    type: String,  // post, comment, 
    _id: String,
    creator : {type: String, ref: "User"},
    creationDate : { type: Date, default: Date.now}, 
    parent: {type: String, ref: "Item"},
    contents: String
});

// create the model for users and expose it to our app
module.exports = createModel('Item', itemSchema);
