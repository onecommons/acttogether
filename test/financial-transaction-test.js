var express     = require('express');
var request     = require('supertest');
var assert      = require('chai').assert;
var mongoose    = require('mongoose');
var bp          = require('../lib/oc-balanced');
var m           = require('../models');


describe('FT', function () {
    
    var db, theUser, theFI, theFT;
    var theUserPwd = 'testuser';


    var app = express();
    app.use(express.bodyParser());
    var spp = require('../routes/payments').setupPaymentPlanPost; 
    app.post('/setup-payment-plan', spp); // add jswig routes to app.


    before(function(done) {
      db = mongoose.connect('mongodb://localhost/test');

      // clear users and add test user record
      m.User.remove({} ,function(){
        theUser                   = new m.User();
        theUser.displayName       = "TestGuy";
        theUser.local.email       = "test@user.com"
        theUser.local.password    = "$2a$08$/06iuOSo3ws1QzBpvRrQG.jgRwuEJB20LcHsWyEWHhOEm/ztwqPG."; // "testuser"
        theUser._id               = "@User@0";
        theUser.paymentPlan.amount    = "2000"; 
        theUser.paymentPlan.frequency = 'monthly';
        //     .paymentPlan.lastCharge = null   (by default)

        theUser.save( function(err, uback){
          theUser = uback;
          m.FundingInstrument.remove({} ,function(){
            theFI              = new m.FundingInstrument();
            theFI.user         = theUser._id;
            theFI.bp_token     = '/cards/CC6EdoVFsRDJbOrHvNcmq6VR' // good test card
            theFI.save( function(err, fiback){
              theFI = fiback;
              theUser.paymentPlan.fi = theFI._id;
              theUser.save(function(err,uback){
                theUser = uback;
                m.FinancialTransaction.remove({}, done); 

        }) }) }) }) })

    }); // before()

    beforeEach(function(done){
      m.FinancialTransaction.remove({} ,function(){
        theFT             = new m.FinancialTransaction();
        theFT.user        = theUser._id;
        theFT.fi          = theUser.paymentPlan.fi;
        theFT.amount      = theUser.paymentPlan.amount;
        theFT.save(done);
      }) 
    }); // beforeEach


    it('should do a proper debit with the given correct data', function(done){
      // confirm theFT is fully filled in.
      assert.isNotNull(theFT.fi);
      assert.isNotNull(theFT.user);
      assert.isNotNull(theFT.amount);
      theFT.doDebit({}, function(err, ftback){
        assert.isNull(err);
        assert.equal(ftback.status, 'succeeded');
        done();
      }) 
    });

    it('shouldnt do a credit yet', function(done){
      theFT.doDebit({ transactionType: 'credit'}, function(err, ftback){
        assert.isNotNull(err);
        //console.log(err);
        done();
      }) 
    });

    it('shouldnt do a proper debit with an unsupported payment processor', function(done){
      theFT.doDebit({ paymentProcessor: 'stripe'}, function(err, ftback){
        assert.isNotNull(err);
        //console.log(err);
        done();
      }) 
    });


    it('shouldnt do anything if user unfound', function(done){
      theFT.doDebit({ user: undefined }, function(err, ftback){
        assert.isNotNull(err);
        done();
      }) 
    });


    // it('Q version should find user', function(){
    //   theFT.doDebitQ()
    //   .then(function(rv){console.log(rv); done()}, 
    //         function(rv){console.log(rv); done()});
    // });

    // it('Q version shouldnt find user if FT ref to it is blown', function(done){
    //   theFT.doDebitQ({user: null})
    //   .then(function(rv){console.log(rv); done()}, 
    //         function(rv){console.log(rv); done()});
    // });

 
    it('should give proper error if cant reach payment processor', function(done){
      theFI.bp_token = "/xxxxx"; // completely whack url.
      theFI.save(function(){
        theFT.doDebit({}, function(err, ftback){
          assert.isNotNull(err);
          done();
        }) 
      })
    });

    it('should give proper error if card refused', function(done){
      theFI.bp_token = "/cards/CC3h0aMqs0opvI0UAq7LS1O2"; // bad card.
      theFI.save(function(){
        theFT.doDebit({}, function(err, ftback){
          assert.isNotNull(err);
          done();
        }) 
      })
    });

});