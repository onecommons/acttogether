var express = require('express')
var mongoose = require('mongoose');
var request = require('supertest');
var m = require('../models');

describe('Authentication', function() {
  // create a test user for login
  before(function(done) {
    var app = require('./fixtures/app');
    app.startApp(function() {
      m.User.remove({}
      ,function(){
          theUser = new m.User();
          theUser.displayName = "Test User";
          theUser.local.email = "test@onecommons.org";
          theUser.local.password = "$2a$08$9VbBhF8kBcKIwLCk52O0Guqj60gb1G.hIoWznC806yhsAMb5wctg6"; // test
          theUser._id = "@User@123";
          theUser.save(done);
        });
    }, false); //don't start listening because supertest will do that 
  });

  // remove users after test
  after(function(done){
    m.User.remove({}, function(err) {
      mongoose.connection.close(done);
    });
  });

  describe('local login', function(){

    it('should fail a nonexistent username', function(done) {
      request(app)
      .post('/login')
      .type('form')
      .redirects(0)
      .send({email:"asdfasdfa@onecommons.org", password:"badpassword"})
      .expect(302)
      .expect('Location', '/login')
      .end(done)
    });

    it('should fail an incorrect password', function(done) {
      request(app)
      .post('/login')
      .type('form')
      .redirects(0)
      .send({email:"test@onecommons.org", password:"badpassword"})
      .expect(302)
      .expect('Location', '/login')
      .end(done)
    });

    it('should accept a correct username & password', function(done) {
      request(app)
      .post('/login')
      .type('form')
      .redirects(0)
      .send({email:"test@onecommons.org", password:"test"})
      .expect(302)
      .expect('Location', '/profile')
      .end(done)
    });

  });

})