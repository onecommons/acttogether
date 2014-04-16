
var mongoose = require("mongoose");
var util = require('util');

/*
 * @param {String} name model name
 * @param {Schema} [schema] (plain object or Schema object)
 * @param {String} [options] schema options (optional, only use if schema is plain object)
 * @param {Model} [baseModel] base model to inherit from (optional)
 * @api public
 */
module.exports.createModel = createModel = function(modelName, schema, options, baseModel) {
  if (options && options.model && options.schema) { //hacky duck-typing
    baseModel = options;
    options = undefined;
  }

  var requiredKeys = {
    _id: String
  };
  
  if (!baseModel) //don't add this if derived class since mongoose already will
    requiredKeys['__t'] = {type: String, default: modelName}

  var isSchemaInstance = schema instanceof mongoose.Schema;
  for (var key in requiredKeys) {
    if (!requiredKeys.hasOwnProperty(key))
      continue;
    var val = requiredKeys[key];
    if (isSchemaInstance) {
      schema.path(key, val);
    } else { //plain object
      schema[key] = val;
    }
  }
  
  var model;
  if (baseModel) {
    if (isSchemaInstance) {
      if (!(schema instanceof baseModel.schema.constructor)) {
        new Error(schema.constructor.name + " must inherit from " +  baseModel.schema.constructor.name);
      }
    } else { 
      //schema is just the definition
      //create a new schema class derived from the base class
      var schemaClass = function(){ 
        baseModel.schema.constructor.apply(this, arguments);
        //copy base schema
        var This = this;
        baseModel.schema.eachPath(function(key, val) {
          if (key != '__t')
            This.paths[key] = val; 
        });
      };
      util.inherits(schemaClass, baseModel.schema.constructor);
      schema = new schemaClass(schema, options); 
    }
    model = baseModel.discriminator(modelName, schema);
  } else {
    if (options)
      schema = new mongoose.Schema(schema, options);
    model = mongoose.model(modelName, schema);
    //don't do this if baseClass or else it will get call twice
    model.schema.pre('save', function(next){
       //console.log("IN SAVE HOOK", this._id, modelName, this.constructor.modelName);
       if(this.isNew && !this._id){
           this._id =  '@' + this.constructor.modelName + '@' + mongoose.Types.ObjectId().toString();
          //  console.log('rewriting id', this._id);
       }
       next();
   });
 }   

  return model; 
};

module.exports = exports = createModel;

