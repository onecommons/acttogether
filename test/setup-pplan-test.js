var express     = require('express');
var request     = require('supertest');
var assert      = require('chai').assert;
var mongoose    = require('mongoose');
var bp          = require('../lib/oc-balanced');
var m           = require('../models');


describe('setup payment plan', function () {
    
    var db, theUser, debitparams;
    var theUserPwd = 'testuser';


    var app = express();
    app.use(express.bodyParser());
    var spp = require('../routes/payments').setupPaymentPlanPost; 
    app.post('/setup-payment-plan', spp); // add jswig routes to app.


    before(function(done) {
      db = mongoose.connect('mongodb://localhost/test');

      // clear users and add test user record
      m.User.remove({}
      ,function(){
          theUser = new m.User();
          theUser.displayName = "TestGuy";
          theUser.local.email = "test@user.com"
          theUser.local.password = "$2a$08$/06iuOSo3ws1QzBpvRrQG.jgRwuEJB20LcHsWyEWHhOEm/ztwqPG."; // "testuser"
          theUser._id = "@User@0";
          theUser.save();
          m.FundingInstrument.remove({}
      ,function(err){
          m.FinancialTransaction.remove({}, done);

      });  });

    }); // before()

    beforeEach(function(){
      debitparams = {
        donationOptions: [ '1000', '2500', '5000' ],
        'custom-donation-amount': '',
        frequencyOptions: [ 'once', 'monthly', 'yearly' ],
        donationAmount: '2500',
        donationFrequency: 'monthly',
        fundingInstrument: '/cards/CC1H6PIzndUjR7Si1WtDAuoa',
        cclastfour: '1111',
        ccname: 'John Doe',
        ccexp: '1220',
        cctype: 'visa',
        userId: '@User@0' // temp!!! will get from session eventually in endpoint handler.
      }
      console.log('in beforeEach: fi = ', debitparams.fundingInstrument);
    });


    it('should do a debit with good data and update user, fi, ft', function(done){
      request(app)
          .post('/setup-payment-plan')
        //  .auth(theUser.local.email, theUserPwd)
          .send(debitparams)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err,res){
            assert(!err);

             m.FundingInstrument.findOne({}
             ,function(err,fi){
                assert.equal(fi.user, theUser._id);
                assert.equal(fi.bp_token, debitparams.fundingInstrument); // fi has been created.

             m.User.findOne({_id: theUser.id}
             ,function(err,u){
                // console.log(u);
                assert.equal(u.payPlan.fi, fi._id); // user payment plan has been updated.

             m.FinancialTransaction.findOne({}
             ,function(err, ft){
                assert.equal(ft.status, 'success');
                assert.equal(ft.fi, fi._id);
                assert.equal(ft.user, theUser._id); // FinancialTransaction record has been created.
                done();    

             }) }) });

          }); // .end

    }); // it...

    it('should NOT do a debit with a bad card token', function(done){
      debitparams.fundingInstrument = '/this/is-a-whack-card-token';
      request(app)
          .post('/setup-payment-plan')
          .send(debitparams)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err,res){
            console.log('in NOT test cb', res.body);
            assert.equal(res.body.status, 'error');
            done();
            });// .end()
    });

    it('should NOT do a debit with a bad card token', function(done){
      debitparams.fundingInstrument = '/this/is-a-whack-card-token';
      request(app)
          .post('/setup-payment-plan')
          .send(debitparams)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err,res){
            console.log('in NOT test cb', res.body);
            assert.equal(res.body.status, 'error');
            done();
            });// .end()
    });

});