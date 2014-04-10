// mongoose-nameid.js

// we would like to have document _id fields be strings which have embedded the name of the model. 
// This is hard. the next best thing, which this module supports, is to have such ids with the embedded
// name of the schema. If multiple models are defined on the same schema, this doesn't help you discriminate
// between them by id, but it's something anyway.

// Usage: Instead of using mongoose.Schema, use this thing.

// var mongoose = require('mongoose');
// var mni = require('mongoose-nameid');

// use mni.createSchema() as you would mongoose.Schema(), but with the addition of the schema name as the first argument.
//   Your _id fields will be strings like 
//    @mySchemaName@534711deb070a0e7a20cb44a
// 

var mongoose = require('mongoose');
var util = require('util');
// var bcrypt   = require('bcrypt-nodejs');

var ID_PLACEHOLDER = "@@nameId@@";

// module.exports.NAME_ID = {type: String, default: NAME_TAG_STR}

module.exports.createSchema = function(schemaName, opts){
     opts._id = {type: String, default: ID_PLACEHOLDER};
     
     var newSchema = new mongoose.Schema(opts);
     newSchema.pre('save', function(next){
         if(this._id === ID_PLACEHOLDER){
             this.set('_id', '@' + schemaName + '@' + mongoose.Types.ObjectId().toString());
         }
         next();
     });
     
     return newSchema;
}

/*
var defaultSave = mongoose.Model.prototype.save;
mongoose.Model.prototype.save = function(cb) {
    console.log(this);
    if (this._id === ID_PLACEHOLDER) {
        this._id = '@' + 'WUT?!?!' + '@' + mongoose.Types.ObjectId().toString();
    }
    defaultSave.call(this, cb);
}



module.exports.createModel = function(modelName, schema) {

    var model = mongoose.model(modelName, schema);
    // console.log("model", util.inspect(model));
    
    schema.pre('save', function(next){
         console.log("IN SAVE HOOK", this._id);
         if(this.isNew){
             console.log('rewriting id');
             this._id =  '@' + this.modelName + '@' + mongoose.Types.ObjectId().toString();
         }
         next();
     });
     
     
    console.log("model._id ", model._id);
    return model; 
}
*/
