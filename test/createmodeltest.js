var mongoose = require("mongoose");
var createModel = require('../lib/createmodel');
var assert = require('chai').assert;

describe('createModel', function(){
    var db;
    var s;
    
    before(function(done) {
        db = mongoose.connect('mongodb://localhost/test', done);
        s = new mongoose.Schema({
             //__t: String,
             // _id: String,
             prop1: []
             },{strict: 'throw'});
        
    });
    
    afterEach(function(done) {
        db.connection.db.dropDatabase(done);
    });
    
    after(function(done){
      db.connection.db.dropDatabase(function(){
        db.connection.close(function(){
          done();
        });
      });
    });
    
    it('should make a model and instance based on a schema', function(done) {
            
        var Test = createModel("Test", s);
        var t = new Test();
        t.save(function() {
            Test.findOne(function(err,doc) {
                assert.instanceOf(doc, Test);
                done();
            })
        });        
    });
    
     it('should make a model and instance without a schema', function(done) {
            
        var Test3 = createModel("Test3", {prop2: String});
        var t = new Test3();
        t.save(function() {
            Test3.findOne(function(err,doc) {
                assert.instanceOf(doc, Test3);
                done();
            })
        });        
    });
    
    it('should make a base and a derivative model', function(done) {
        var Testbase = createModel("Testbase",{prop2: String});
        var Testd = createModel("Testd",
            {prop3: String, prop4: String},  Testbase);
             
        var base = new Testbase();
            base.save();
            
        var derived = new Testd();
        derived.prop4 = "This is prop4";
        derived.save(function() {
          Testbase.findOne({_id: base._id}, function(err, doc) {
            assert.instanceOf(doc, Testbase);
            Testbase.findOne({_id: derived._id}, function(err,doc2){
                assert.equal(doc2.prop4, "This is prop4");
                assert.instanceOf(doc2,Testd);
                done();
            });
          });
        });

   });

 it('should make a model and instance based on a schema and a derivative from it', function(done) {
        var s2 = new mongoose.Schema({
             //__t: String,
             // _id: String,
             prop1: []
             }, {strict: 'throw'});

        var Test2 = createModel("Test2", s2);
        var TestDeriv = createModel("TestDeriv", {parent: String}, Test2);
        var td = new TestDeriv();
        td.parent = 'test';
        var t = new Test2();
        t.save(function(err, doc) {
            assert(!err);
            assert(doc instanceof Test2);
            td.save(function(err, doc) {
              Test2.findOne(function(err,doc) {
                  assert.instanceOf(doc, Test2);
                  TestDeriv.findOne(function(err,doc){
                      assert.instanceOf(doc,TestDeriv);
                      done();
                  });
               });
           });
        });        
    });
       
 }); // describe...

