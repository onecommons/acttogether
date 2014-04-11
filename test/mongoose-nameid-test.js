// app/models/item.js
var should = require('should')
  , assert = require('assert')
  ;
  
  
var mongoose = require('mongoose');
var util = require('util');
var nid = require('../lib/mongoose-nameid');
  

// variation one: our schema creation, standard model creation
/*
var Item = new sf.Schema('items', {
    first_name: String,
    last_name: String
});

var ItemModel = mongoose.model('Item', Item);
*/

function rndString(len)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


var db;

// variation two: standard schema cration, our model creation.
describe('schema name ids', function() {
    
    before(function(){
       db = mongoose.connect('mongodb://localhost/db');    
    });
    
    after(function(){
        mongoose.connection.close();
    });
    
    it('should write/read records with ids we like', function(done){
        var Item = nid.createSchema( 'Item',{
            first_name: String,
            last_name: String,
        });


        var ItemModel = mongoose.model('Item', Item);

        var record = new ItemModel();

        record.first_name = rndString(10);
        record.last_name =  rndString(10);

       record.save(function (err) {
    
        ItemModel.find({}, function(err, users) {
        
        var passed = false;
        for (var i=0, counter=users.length; i < counter; i++) {

          var user = users[i];

         //  console.log( "Item => _id: " + user._id + ", first_name: " + user.first_name + ", last_name: " + user.last_name );

        }
        
       //  mongoose.connection.close();
        done();
        
      });

   });
  });
 });