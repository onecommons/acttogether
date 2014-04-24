// datarequest.js  route

var datastore = require('datastore');
var jsonrpc   = require('jsonrpc');


module.exports = function(app){

    // 
    // data request endpoints
    //
    app.post('/datarequest', function (req, res, next) {  
        var ds = new datastore.MongooseDatastore();
        jsonrpc.router(req, res, next, new datastore.RequestHandler(ds),
          datastore.pJSON.stringify);
      });


}