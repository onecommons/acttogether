// datarequest.js  route
var datastore = require('../lib/datastore');
var jsonrpc   = require('../lib/jsonrpc');

// data request endpoints
module.exports = function (req, res, next) {  
    var ds = new datastore.MongooseDatastore();
    jsonrpc.router(req, res, next, new datastore.RequestHandler(ds),
      datastore.pJSON.stringify);
}