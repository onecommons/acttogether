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
    
    /*
    it('should connect',  function(done){
    var collection = testdb.collection('unittests');
         jsonrpc.router(req, res, next, new datastore.RequestHandler(collection), datastore.pJSON.stringify);
    }); */
  });

});
