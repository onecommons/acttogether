// app/models/item.js

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var itemSchema = mongoose.Schema({
    type: String,  // post, comment, 
    _id: String,
    creator : {type: String, ref: "User"},
    creationDate : { type: Date, default: Date.now}, 
    parent: {type: String, ref: "Item"},
    contents: String
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Item', itemSchema);
