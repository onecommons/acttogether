// login.js  routes for login/logout and authentication.

var passport      = require('passport');

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

  // if user is authenticated in the session, carry on
  if (req.isAuthenticated())
    return next();

  // if they aren't redirect them to the home page
  res.redirect('/');
}

module.exports = function(app){

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

}