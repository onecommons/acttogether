// about.js  route
var getVars = require('utils').getVars;

// Render 'about' static pages
module.exports = function(req, res) {
  console.log("handling about pagename= ", req.params.pagename);
  res.render(req.params.pagename, getVars({
    categories: [{
      id: 1,
      title: "Environment",
      activity: [{
          avatar: "/static/images/user01.jpg",
          itemtype: "review",
          contents: 'EllenR reviewed <i>Build a well in Foobaristan</i>'
        }, {
          avatar: "/static/images/user02.jpg",
          itemtype: "post",
          contents: "SamG shared a link: <a href='#'>Nebraska judge calls law that let governor approve Keystone XL pipeline route unconstitutional</a>"
        }, {
          avatar: "/static/images/user01.jpg",
          itemtype: "nomination",
          contents: 'Sarah endorsed <i>Build a well in Foobaristan</i>'
        },
        /* { avatar: "",
          itemtype: "comment",
          contents: ""
          },*/
      ],
      topProposal: {
        title: "tusk.org",
        heroimage: "/static/images/tusk-org.jpg",
        endorsements: 128
      }

    }, {
      title: "Human Rights",
      activity: [],
    }, {
      title: "Education",
      activity: []
    }, {
      title: "Internet Freedoms",
      activity: []
    }, ]
  }));
}