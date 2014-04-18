/*
 * GET home page.
 */

var utils = require('utils');
var Item  = require('../models/item');
var util = require('util');

function getTimeLeft(target_date) {
  var difference = target_date - new Date();

  // basic math variables
  var _second = 1000,
    _minute = _second * 60,
    _hour = _minute * 60,
    _day = _hour * 24;

  // calculate dates
  var days = Math.floor(difference / _day),
    hours = Math.floor((difference % _day) / _hour),
    minutes = Math.floor((difference % _hour) / _minute),
    seconds = Math.floor((difference % _minute) / _second);

  // fix dates so that it will show two digets
  days = (String(days).length >= 2) ? days : '0' + days;
  hours = (String(hours).length >= 2) ? hours : '0' + hours;
  minutes = (String(minutes).length >= 2) ? minutes : '0' + minutes;
  seconds = (String(seconds).length >= 2) ? seconds : '0' + seconds;

  return [days, hours, minutes, seconds];
}

function getVars(more) {
  more = more || {};
  var now = new Date();
  var nextMonth = new Date(2014, now.getMonth() + 1, 1);
  return utils.merge({
    debug: process.env.DEBUG,
    countdownfinish: nextMonth.toString(),
    timeLeft: getTimeLeft(nextMonth),
  }, more)
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}

module.exports = function(app, passport) {

    // add route for browser-side testing, specifying a unitname.
    // testname may be specified in URL with a ?testname=basetestname param;
    // if none present, testname is assumed to be unitname-test
    //
    if( process.env.BROWSER_TEST){
        app.get('/browsertest/:testname', function(req, res) {
            res.render('browsertest.html', getVars({ // trp test will be browsertestframe.html
                testName: req.params.testname}));
            });
    }


  // Home Page
  app.get('/', function(req, res) {
    res.render('index', getVars());
  });

  // Render 'about' static pages
  app.get('/about/:pagename', function(req, res) {
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
  });

  //
  // Login & logout page
  //
  app.get('/login', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('login.html', { message: req.flash('loginMessage') });
  });

  app.post('/login', passport.authenticate('local-login', {
      successRedirect: '/profile', // secure profile section
      failureRedirect: '/login',   // back to login on error
      failureFlash: true
  }));

  app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
  });

  //
  // Signup page
  //
  app.get('/signup', function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render('signup.html', { message: req.flash('signupMessage') });
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // secure profile section
    failureRedirect: '/signup',  // back to signup on error
    failureFlash: true
  }));

  // profile page (debug)
  app.get('/profile', isLoggedIn, function(req, res) {
    console.log(req.user);
    res.render('profile.html', {
      user : req.user
    });
  });

  //
  // Facebook login handlers
  //
  app.get('/auth/facebook', passport.authenticate('facebook', {
      scope: 'email'
  }));

  app.get('/auth/facebook/callback', passport.authenticate('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
  }));


  //
  // post detail
  //
  app.get('/post/:id', function(req,res){

      // get the post and comments.
      var postItem = {}
        , commentItems = [];


      Item.find({ parent: "item_" + req.params.id}, function(err, Items){
          for(var i=0, n=Items.length; i < n; i++){
             if(Items[i].type === 'post'){
                  postItem = Items[i];
                  console.log(postItem);
                  console.log("postItem.type", postItem.type);
              } else {
                  commentItems.push(Items[i]);
              }
           }
           var testItem = new Item();
           console.log(testItem);
           // console.log(postItem["contents"]);
           res.render('post.html', {
               post: postItem,
               comments: commentItems
           });

      });

    /*
      res.render('post.html', {
        post: {contents: "lskdjflskdjf"}, // postItem.contents, // postItem,
        comments: commentItems
      });
     */

  });

} // end routes function
