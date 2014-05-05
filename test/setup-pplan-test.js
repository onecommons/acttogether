var express     = require('express');
var request     = require('supertest');
var assert      = require('chai').assert;
var mongoose    = require('mongoose');
var bp          = require('../lib/oc-balanced');
var m           = require('../models');


describe('setup payment plan', function () {
    
    var db, theUser, debitparams;


    var app = express();
    app.use(express.bodyParser());
    var spp = require('../routes/payments').setupPaymentPlan; 
    app.post('/setup-payment-plan', spp); // add jswig routes to app.


    before(function(done) {
      db = mongoose.connect('mongodb://localhost/test');

      debitparams = {
        donationOptions: [ '1000', '2500', '5000' ],
        'custom-donation-amount': '',
        frequencyOptions: [ 'once', 'monthly', 'yearly' ],
        donationAmount: '2500',
        donationFrequency: 'monthly',
        fundingInstrument: '/cards/CC5qnOfprsLelzxV4CZWv7Xk',
        cclastfour: '1111',
        ccname: 'John Doe',
        ccexp: '1220' 
      }

      // setup user record.
      theUser = new m.User();
      theUser.displayName = "JohnDoe";
      theUser.save(function(err,userback){
        theUser = userback;
        // since we dont have sessions working yet, include userId in form submission data.
        debitparams.userId = theUser._id;
        done();
      });
    });

    after(function(done){
      var db = mongoose.connection;
      db.db.dropCollection('users');
      done();
    });

    it('should have made theUser', function(done){
      assert.equal(theUser.displayName, 'JohnDoe');
      assert.isNotNull(theUser._id);
      done();
    });

    it('should do a debit with good data', function(done){
      request(app)
          .post('/setup-payment-plan')
          .send(debitparams)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err,res){
            //console.log(res.body);
          })
      done();
    });

    it('should NOT do a debit with a bad card token', function(done){
      debitparams.fundingInstrument = '/this/is-a-whack-card-token';
      request(app)
          .post('/setup-payment-plan')
          .send(debitparams)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err,res){
            assert.equal(res.body.status, 'error');
            // console.log(res.body);
          })
      done();
    });

});