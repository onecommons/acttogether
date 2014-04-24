// jswigtest.js – test the jswig endpoint

var express			= require('express');
var request 		= require('supertest');
var assert			= require('chai').assert;
// var request 		= request('http://localhost:3000');

describe('jswig endpoint', function(){


	var app = express();

	app.use(express.bodyParser());

	require('../routes/jswig')(app); // add jswig routes to app.

	it('should get our jswigtest-pass.html correctly', function(done){

		request(app)
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

		request(app)
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

		request(app)
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