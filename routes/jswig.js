// jswig.js  route

var swig      = require('swig');
var fs        = require('fs');


module.exports = function(app){

   // compiled partial template endpoint
   app.get('/jswig/:tmpl', function(req,res,next){
      // look for a <tmpl>.html file, compile it into js and return it.
      var tpl;
      var thePath = app.settings.views + '/partials/' + req.params.tmpl + '.html';
 
      fs.exists(thePath, function(exists){
        if(!exists) {
          res.send(404);
          return;
        } else {
          fs.readFile(thePath, function (err, data) {
            if (err) {
              next(err); 
              return;
            }
            try 
            {
             tpl = swig.precompile(data.toString()).tpl.toString().replace('anonymous', '');
            } catch(err) {
              next(err);
              // console.log("swig error: ", err);
              // res.send('500', "Swig " + err);
              return;
            }
            // console.log(tpl); 
            res.type('application/javascript');
            res.send(tpl);
          });
        }
      }); // fs.exists...


   }); // app.get('/jswig/:tmpl'...)


}