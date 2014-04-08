// app/models/post.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var postSchema = mongoose.Schema({
    title : String,
    slug : String,
    author : {type: Schema.Types.ObjectId, ref: "User"},
    publishedDate : { type: Date, default: Date.now},
    content  : {
        brief : String,
        extended : String
    }
    
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Post', userSchema);
