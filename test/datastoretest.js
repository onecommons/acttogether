var should = require('should')
  , assert = require('assert')
  , mongodb = require('mongodb')
  , datastore = require('datastore');
var DBRef = mongodb.DBRef, ObjectID = mongodb.ObjectID;

describe('datastore', function(){
  describe('.pJSON', function(){
    var obj1  = {k:ObjectID("530936daf48be9095b414c52"), l:'@@escaped'};
    var json1 = datastore.pJSON.stringify(obj1);
    //console.log(obj1.k.constructor, obj1.k);
    json1.should.equal('{"k":"@@530936daf48be9095b414c52","l":"::@@escaped"}');
    assert.deepEqual(obj1.k, ObjectID("530936daf48be9095b414c52"), 'obj1 shouldnt have been mutated'); 
    var result1 = datastore.pJSON.parse(json1);
    assert.deepEqual(result1, obj1);
    
    var obj2 = [ObjectID("530936daf48be9095b414c52"), '@@escaped'];
    var json2 = datastore.pJSON.stringify(obj2);
    json2.should.equal('["@@530936daf48be9095b414c52","::@@escaped"]');
    assert.deepEqual(obj2[0],ObjectID("530936daf48be9095b414c52"), 'obj2 shouldnt have been mutated');
    var result2 = datastore.pJSON.parse(json2);
    assert.deepEqual(result2, obj2);

    var json3 = '{"_id":"@1","prop":"test"}'; //user-defined id
    var obj3 = datastore.pJSON.parse(json3);
    var result3 = datastore.pJSON.stringify(obj3);
    assert.deepEqual(result3, json3);
 });

 describe('.mongodb', function(){
    var testdb = null;

    after(function() {
      if (testdb)
        testdb.close();
    });

    it('should connect',  function(done){
       mongodb.MongoClient.connect('mongodb://127.0.0.1:27017/testdb', function(err, db) {
       if(err) throw err;
       testdb = db;
       db.dropCollection('unittests', function(err, result) {
          //may or may not exits, if it doesn't err will be set
          done();
       });
      });
    });

    it('should have an empty collection', function(done) {
      assert(testdb);
      testdb.collection('unittests').count(function(err, count) {
        assert(!err);
        assert(count == 0);
        done();
      });
    });
    
    var ds = null;
    it('should create a new doc',  function(done){
      var collection = testdb.collection('unittests');
      ds = new datastore.Datastore(collection);

      ds.create({
         prop1 : []
      }, function(err, doc) {
        assert(!err)
        assert(doc[0]._id, JSON.stringify(doc));
        lastid = doc[0]._id;
        assert(Array.isArray(doc[0].prop1));
        done();
      });
    });

    it('should not create a doc with existing id',  function(done){
      assert(ds);
      ds.create({
              _id: lastid,
              prop2: 'bad'
      }, function(err, doc) {
        assert(err && err.code == 11000); //duplicate key error
        assert(!doc);
        done();
      });
    });

    it('create with user-defined ids',  function(done){
      assert(ds);
      ds.create('{"_id": "@1","prop": "test"}', function(err, doc) {
        assert(!err, JSON.stringify(err));
        assert.deepEqual(doc, [{_id:"1",prop:"test"}]);
        done();
      });
    });

//     Uncaught AssertionError: {"name":"MongoError","err":"Cannot apply $addToSet modifier to non-array","code":12591,"n":0,"connectionId":338,"ok":1}
    it('add a property',  function(done){
      assert(ds);
      var obj = '{"_id": "@@' + lastid + '","prop-new": "another value"}';
      //console.log(obj); //{"_id": "@@5334d39164dd7bdb9e03cc7c","prop-new": "another value"}
      ds.add(obj, function(err, doc) {
        assert(!err, JSON.stringify(err));
        console.log(JSON.stringify(doc));
        assert(doc == 1); //1 object inserted
        //XXX query and test for property value
        done();
      });
    });

    describe('.jsonrpc', function(){
      var express = require('express')
       , request = require('supertest')
       , jsonrpc = require('jsonrpc');

      var app = express();
      app.use(express.bodyParser({reviver: datastore.pJSON.reviver}));

      app.post('/', function (req, res, next) {
          assert(testdb);
          var collection = testdb.collection('unittests');
          jsonrpc.router(req, res, next, new datastore.RequestHandler(collection),
            datastore.pJSON.stringify);
      });

      it('should create objects', function(done){
        request(app)
        .post('/')
        //.set('Content-Type', 'application/json') //unnecessary since its the default
        .send(
          [{"jsonrpc":"2.0","method":"create","params":{"_id":"@2","prop1":"adds a value to prop1"},"id":05968226976111071},{"jsonrpc":"2.0","method":"transaction_info","params":{"comment":"created $new05968226976111071"},"id": 49884485029342773}]
          )
        .expect('[{"jsonrpc":"2.0","id":5968226976111071,"result":[{"_id":"@2","prop1":"adds a value to prop1"}]},{"jsonrpc":"2.0","id":49884485029342776,"result":{}}]', done);
      });

    });
    
  });

});
