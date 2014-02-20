var express = require("express");
var dataform = require("dataForm");
// var fs = require('fs');
var path = require('path');

//var app = express.createServer( express.static(__dirname + '/public'));
var express = require("express");
var app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.set('view options', { layout: false });

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

app.get('/basic', function(req,res) {
    res.render('basic.ejs', {title : 'My Title'});
});

app.listen(3000);

console.log("Express listening on port 3000");