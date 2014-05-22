var should = require('should')
  , assert = require('assert')
  , item = require('../models/item')
  , user = require('../models/user')
  , mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ocdemo');

// var db = mongoose.connection;
var Item = mongoose.model('Item', item.itemSchema);

var post = new Item({type: 'post', content: "Mongoose created TEXT content AGAIN"}); 
var postId;

post.save(function(err){
    Item.find({}, function(err, Items){
        for(var i=0, n=Items.length; i < n; i++){
            var Item = Items[i];
            console.log("Item => _id: " + Item._id + ", type: " + Item.type);
        }
    
    });
});


var comments = [];
var c;
var nComments = 10;
for(var i = 0; i < nComments; i++){
    c = new Item({type: 'comment', parent: postId; content: "comment number " + i });
    comments.push(c);
    Item.find
    for(var i=0, n=nComments; i < n; i++){
    
    }
    
}





// describe('foo', function() {
//     var post = new Item({type: 'post', content: "Mongoose created TEXT content"});    
//     var comments = [];
//     var nComments = 10;
//     for(var i = 0; i < nComments; i++){
//         comments.push(new Item({type: 'comment', content: "comment number " + i }));
//     }
//     
//     
//     it('should make and save a post', function() {
//          // console.log(post);
//          assert(post.type === 'post');
//          post.save(function(err) {
//              Item.find({type: 'post'}, function(err,Items){
//                  for(var i, n = Items.length; i < n; i++){
//                      console.log(Items[i]);
//                  }
//              });
//         });
//     });
// 
//     it('should make some comments', function() {
//          console.log(comments.length + " comments defined.");
//          assert(comments[0].type === 'comment');
//          assert(comments.length === nComments);
//     });
//     
//     // it('should find a post in the db'), function(done) {
//     //     Item.findOne({type: 'post'}, function(err,item){
//     //         console.log(item); 
//     //         done();
//     //     });
//         
//  });
// 
