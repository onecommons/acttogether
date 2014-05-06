// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
var createModel = require('../lib/createmodel');

// define the schema for our user model
var userSchema = mongoose.Schema({

    displayName       : String,
    avatarUrl         : String,

    payplan           : {
                          frequency  : { type: String, enum: ['once','monthly','quarterly','yearly']},
                          lastCharge : { type: Date, default: 0},
                          fi         : { type: String, ref: 'FundingInstrument'}
                         },

    local            : {
        email        : String,
        password     : String,
     },
    facebook         : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    },
    twitter          : {
        id           : String,
        token        : String,
        displayName  : String,
        username     : String
    },
    google           : {
        id           : String,
        token        : String,
        email        : String,
        name         : String
    }

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = createModel('User', userSchema);
