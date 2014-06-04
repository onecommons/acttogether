// db_tests.js
// executed from browser.

function verifyQuery(query, expected, done) {
  var errormsg = 'unexpected result for query: ' + JSON.stringify(query);
  $(document).dbQuery(query,
   function(data) {
      //console.log("results for query", JSON.stringify(query), "got", JSON.stringify(data), " expected ", JSON.stringify(expected));
      assert(data.error === undefined, 'unexpected error for query:' + JSON.stringify(data.error));
      assert(Array.isArray(data), errormsg + " expected an array");
      //javascript doesn't provide an easy way to do deep equality on objects,
      //so instead we'll compare JSON strings of objects
      assert.deepEqual(data, expected, errormsg + " got " + JSON.stringify(data) + ' expected ' + JSON.stringify(expected));
      done();
  });
}

describe('db_tests', function() {

  $.db.url = '/datarequest';
  var pjson1 = {
       _id : '@DbTest1@1',
       __t: 'DbTest1',
       prop1 : '1 prop1 val'
  };

  it('should do dbCreate', function(done) {
      var expected = [{
       _id : '@DbTest1@1',
       __t: 'DbTest1',
       __v: 0,
       prop1 : ['1 prop1 val']
      }];

      $(document).dbCreate(pjson1, function(resp) {
        // console.log("RESPONSE:", JSON.stringify(resp));
        assert.equal(pjson1.prop1, resp.prop1, JSON.stringify(resp));
        assert.equal(pjson1._id, resp._id);
        verifyQuery({_id: pjson1._id}, expected, done);
      });
  });

  var modifiedprop = ["modified property value"]
  var expected = [{
   _id : '@DbTest1@1',
   __t: 'DbTest1',
   __v: 1,
   prop1 : modifiedprop
  }];

  it('should do one dbUpdate', function(done) {
      var mod = pjson1;
      mod.prop1 = modifiedprop;
      $(document).dbUpdate(mod, function(resp) {
          assert.deepEqual(mod.prop1, resp.prop1);
          verifyQuery({_id: pjson1._id}, expected, done);
      });
  });

  it('should do client-side rollback', function(done) {
      var mod = pjson1;
      mod.prop1 = ['whatever'];
      $(document).dbBegin().dbUpdate(mod, function(resp) {
        //console.log('client-side rollback', JSON.stringify(resp));
        verifyQuery({_id: pjson1._id}, expected, done);
      }).dbRollback();
  });

  it('should delete an object', function(done) {
      $(document).dbDestroy([pjson1._id], function(resp) {
        assert.deepEqual(resp, {"_id":"@DbTest1@1","prop1":[]});
        verifyQuery({_id: pjson1._id}, [], done);
      });
  });

});
