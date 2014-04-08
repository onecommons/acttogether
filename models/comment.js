// app/models/post.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var commentSchema = mongoose.Schema({
    post : {type: Schema.Types.ObjectId, ref: "Post"},
    author : {type: Schema.Types.ObjectId, ref: "User"},
    slug : String,
    publishedDate : { type: Date, default: Date.now},
    content  : {
        brief : String,
        extended : String
    }
    
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Comment', userSchema);
