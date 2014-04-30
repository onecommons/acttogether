// blogpost.js  route
var moment = require('moment');
var fs = require('fs');
var Item = require('../models/item');

// post detail
module.exports = function(req, res) {
  // get the post and comments.
  var postItem = {}, commentItems = [],
    theUser = {
      _id: '@user@100'
    }; // vile hack TRP fake current user info. 

  //
  // post detail
  //
  // get the post and comments.
  var postItem = {}
    , commentItems = []
    , theUser = { _id: '@user@100'}; // vile hack TRP fake current user info. 

  Item
    .find({ parent: '@post@'+req.params.id})
    .sort({modDate: 'desc'})
    .populate('creator')
    .exec(function(err,Items) {
      if(err) { console.log("MONGOOSE EXEC ERROR", err);}
      for(var i=0, n=Items.length; i < n; i++){

          switch(Items[i].__t) {
            case 'Post':
              postItem = Items[i];
              break;

            case 'Comment':
              commentItems.push(Items[i]);
              Items[i].ago = moment(Items[i].modDate).fromNow();
              break;

            /* other item types? NIY */
          }
      }
       // console.log(postItem, commentItems);
       var datestr = moment(postItem.modDate).format( "MMMM DD YYYY");
       commentItems.push(
        {
          _id: "@Comment@1",
          content: "hello world",
          ago: "asdfadsf",
          creator: {
            displayName: 'sue'
          }
        }
       )
       res.render('blogpost.html', {
         messages: req.flash('info'),
         post: postItem,
         post_last_edit: datestr,
         comments: { comments: commentItems },
         user: theUser  // vile hack TRP to keep going.
     });

  }); // exec()

}