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

  Item
    .find({
      parent: '@post@' + req.params.id
    })
    .populate('creator')
    .exec(function(err, Items) {
      if (err) {
        console.log("MONGOOSE EXEC ERROR", err);
      }
      for (var i = 0, n = Items.length; i < n; i++) {
        if (Items[i].__t === 'Post') {
          postItem = Items[i];
        } else {
          commentItems.push(Items[i]);
        }
      }
      // console.log(postItem, commentItems);
      var datestr = moment(postItem.modDate).format("MMMM DD YYYY");
      res.render('blogpost.html', {
        post: postItem,
        post_last_edit: datestr,
        comments: commentItems,
        user: theUser // vile hack TRP to keep going.
      });

    });
}