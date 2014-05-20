// db_tests.js
// executed from browser.

describe('db_tests', function() {

	var pjson1, pjson2, pjson3;


	before(function(){
		// $('body').append('<div class="db_tests"></div>');
		$.db.url = '/datarequest';
		pjson1 = {
     		 _id : '@DbTest1@1',
     		 __t: 'DbTest1',
     		 prop1 : '1 prop1 val'
    	};
 		pjson2 = {
     		 _id : '@DbTest1@2',
     		 __t: 'DbTest1',
     		 prop1 : '2 prop1 val'
    	};
 		pjson3 = {
     		 _id : '@DbTest1@3',
     		 __t: 'DbTest1',
     		 prop1 : '3 prop1 value'
    	};
 	});

	beforeEach(function(done){
		$(document).dbDestroy(['@DbTest1@1','@DbTest1@1','@DbTest1@1'], function() {done()});
	});

	afterEach(function(done) {
			// $('div.db_tests').remove();
		$(document).dbDestroy(['@DbTest1@1','@DbTest1@1','@DbTest1@1'],function(){done()});
	});

	it('should do one dbCreate', function(done) {
    	$(document).dbCreate(pjson1, function(resp) {
    		// console.log("RESPONSE:", JSON.stringify(resp));
            check(done, function(){
                assert.equal(pjson1.prop1, resp.prop1);
             //   assert.equal(pjson1._id, resp._id);
            });
    	});

	});

	it('should do one dbUpdate', function(done) {
	    $(document).dbCreate(pjson1, function(resp) {
	    	var mod = pjson1;
	    	var modpropval = ["modified property value"];
	    	mod.prop1 = modpropval;
	   		$(document).dbUpdate(mod, function(resp) {
                check(done,function(){
    			     assert.deepEqual(mod.prop1, resp.prop1);
                });
            });
    	

		});
   });

	it('should delete an object', function(done) {
	   $(document).dbCreate(pjson1, function(resp) {
	    	// console.log("resp",resp);
	   		$(document).dbDestroy([resp._id], function(resp2) {
	   			// console.log("resp2",resp2);
	   			done();
    		});

		});
   });


});