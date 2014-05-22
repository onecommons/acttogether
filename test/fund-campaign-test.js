var express     = require('express');
var request     = require('supertest');
var assert      = require('chai').assert;
var mongoose    = require('mongoose');
var bp          = require('../lib/oc-balanced');
var m           = require('../models');
var u           = require('../lib/utils');

describe('fund campaign', function () {
    var db, theUser, debitparams;
    var theUserPwd = 'testuser';

    this.timeout(10000); // 10s – going out to balanced payments.

    var app = express();
    app.use(express.bodyParser());
    var fcp = require('../routes/payments').fundCampaignPost; 
    app.post('/fund-campaign', function(req, res) {fcp(req,res, theUser);});

    before(function(done) {
      mongoose.connection.close();
      db = mongoose.connect('mongodb://localhost/test');

      // clear users and add test user record
      m.User.remove({}
      ,function(){
          theUser = new m.User();
          theUser.displayName = "TestGuy";
          theUser.local.email = "test@user.com"
          theUser.local.password = "$2a$08$/06iuOSo3ws1QzBpvRrQG.jgRwuEJB20LcHsWyEWHhOEm/ztwqPG."; // "testuser"
          theUser._id = "@User@0";
          theUser.save(function(){
            m.FundingInstrument.remove({}
            ,function(err){
              theFI = new m.FundingInstrument();
              theFI.ccToken = '/cards/CC1H6PIzndUjR7Si1WtDAuoa';
              theFI.user = theUser._id;
              theFI.save(function(err,fi){
                theFI = fi;
                theUser.activeFI = theFI._id;
                theUser.save(function(err,uback){
                  theUser = uback;
                  m.FinancialTransaction.remove({}, done);
     }) }) }) }) }) 

    }); // before


    beforeEach(function(){
      debitparams = {
        amount: '2500',
      }
    });


    it('should do a debit with default campaign and user with established FI and create sub', function(done){
      request(app)
          .post('/fund-campaign')
          .send(debitparams)
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function(err,res){
             // assert(!err);
             m.FundingInstrument.findOne({}
             ,function(err,fi){
                // assert.equal(fi.user, theUser._id);
                // assert.equal(fi.bp_token, debitparams.fundingInstrument); // fi has been created.

                m.User.findOne({_id: theUser.id}
                ,function(err,uback){
                  // console.log(u);
                  m.FinancialTransaction.findOne({}
                  ,function(err, ft){
                    if(err) { throw(err) }
                    assert.isNotNull(ft);
                    assert.equal(ft.status, 'succeeded');
                    assert.equal(ft.fi, fi._id);
                    m.Subscription.findOne({}
                     ,function(err, subback){
                      if(err) { throw err }
                      assert.isNotNull(subback);
                      assert.equal(subback.user, theUser._id);
                      done();
            
         }) }) }) }) });

    }); // it...


});