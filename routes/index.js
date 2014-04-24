/*
 * GET home page.
 */

var utils     = require('../lib/utils');

module.exports = function(app, passport) {

    // get routes defined in other files in current directory (/routes)
    
    require('./jswig')(app);
    require('./blogpost')(app);
    require('./browsertest')(app);
    require('./datarequest')(app);
    require('./login')(app);            // login, logout, signup, profile and auth routes.
    require('./about')(app);


    // Home Page
    app.get('/', function(req, res) {
      res.render('index', utils.getVars());
    });
 
 } // end routes function
