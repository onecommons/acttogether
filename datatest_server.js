var express = require("express");
var dataform = require("dataForm");
// var fs = require('fs');
var path = require('path');

//var app = express.createServer( express.static(__dirname + '/public'));
var express = require("express");
var app = express();
app.use(express.static(path.join(__dirname, 'public')));
//jsonrpc = require('node-express-JSON-RPC2');
datastore = require('datastore');
app.use(express.bodyParser({reviver: datastore.pJSON.reviver}));

app.set('view options', { layout: false });

app.use(express.errorHandler());
app.use(express.methodOverride());

var testdata = { 
  "id" : "testdata1",
  'a string' : 'v',
  'foo\\' : { 'ba.r' : 'v' },
  'has[1]' : 'v',
  'nested' : { 'object' : {'value' : 1 } },
  'none' : null,    
  'enabled' : true, 
  'disabled' : false,
  'emptystring' : '',
  'array' : [0, 1],
  'objectSelection' : '@2',
  'labeledSelection' : 2,
  'simpleSelection' : 'two' 
};

var simpleArray = ['one', 'two'];

var labeledArray = [{ 'value' : 1, 'label': 'once'}, { 'value' : 2, 'label': 'twice'},
   { 'value' : 3, 'label': 'three times'} ];

var objectArray = [{ "id": "@1", 
     "name":"option 1",
     "notes" : ["first"]
   },
   { "id": "@2", 
        "name":"option 2",
        "notes" : []
   }
  ];

var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient
    , format = require('util').format, DBRef = mongodb.DBRef, ObjectID = mongodb.ObjectID;

app.get('/mongotest', function(req,res){
MongoClient.connect('mongodb://127.0.0.1:27017/ocdemo', function(err, db) {
  if(err) throw err;

  var collection = db.collection('test_insert');
  var count=0, results = [];
  collection.insert({a:2}, function(err, docs) {
    collection.count(function(err, _count) {
      count = _count;
      console.log(format("count = %s", count));
    });

    // Locate all the entries using find
    collection.find().toArray(function(err, _results) {
      results = _results;
      results.forEach(function(i){
        if (i.owner) 
          console.log(i.owner, i.owner.prototype, i.owner instanceof ObjectID);  
      })
      
      collection.insert({parent: new DBRef('test_insert', results[0]._id), 
      owner: results[0]._id
      },
        function(err, docs) { /* Cannot use a writeConcern without a provided callback*/ }
      );
      db.close();
      res.end(JSON.stringify(results, undefined, 2));
    });
  });
})

});

// routes -------------------------------------------------
app.get('/datatest', function(req,res){
    res.render('data_test.ejs', {
        title: "DataForm Tests", 
        df : dataform.dataform(),
        testdata : testdata,
        simpleArray : simpleArray,
        labeledArray : labeledArray,
        objectArray : objectArray
     });
});

//curl -d '{"jsonrpc":"2.0","method":"get_data","id":8}' -H "content-type: application/json" http://localhost:3001/api
//response: [{"jsonrpc":"2.0","id":8,"result":["hello",5]}]
var jsonrpc = require('jsonrpc');
app.post('/api', function (req, res, next) {
  jsonrpc.router(req, res, next, {
    get_data: function (params, respond) {
      respond({ result: ["hello", 5] });
    } 
  });
});

app.post('/datastoretest', function(req,res, next){
  MongoClient.connect('mongodb://127.0.0.1:27017/ocdemo', function(err, db) {
    if(err) throw err;
    var collection = db.collection('test_insert');
    jsonrpc.router(req, res, next, new datastore.RequestHandler(collection), datastore.pJSON.stringify);
  });
})


var port = 3001;
app.listen(port);
console.log("Express listening on port "+port);