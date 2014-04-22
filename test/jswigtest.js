// jswigtest.js – test the jswig endpoint

var request 		= require('supertest');
var assert			= require('chai').assert;
var request 		= request('http://localhost:3000');

describe('jswig endpoint', function(){


	console.log('be sure app is running on localhost:3000');

	it('should get our jswigtest-pass.html correctly', function(done){

		request
			.get('/jswig/jswigtest-pass')
			.end(function(err, res){
				if(err){
					throw err;
					done();
				}
				assert.equal(res.status, 200);
				done();
			});
	});

	it('should give 500 error on malformed swig template', function(done){

		request
			.get('/jswig/jswigtest-fail')
			.end(function(err, res){
				// if(err){
				// 	throw err;
				// 	done();
				// }
				if(err){ console.log(err); }
				assert.equal(res.status, 500);
				done();
			});
	});

	it('should give 404 error if template isnt found', function(done){

		request
			.get('/jswig/some-jenky-file-that-doesnt-exist')
			.end(function(err, res){
				// if(err){
				// 	throw err;
				// 	done();
				// }
				assert.equal(res.status, 404);
				done();
			});
	});



});