var express = require('express')
  , request = require('supertest')
  , jsonrpc = require('jsonrpc');

describe('jsonrpc', function(){
  describe('.router', function(){
    it('should route a jsonrpc method', function(done){
      var app = express();
      app.use(express.bodyParser());

      app.post('/', function (req, res, next) {
        jsonrpc.router(req, res, next, {
          get_data: function (params, respond) {
            respond({ result: ["hello", 5] });
          } 
        });
      });

      request(app)
      .post('/')
      //.set('Content-Type', 'application/json') //unnecessary since its the defuault
      .send({"jsonrpc":"2.0","method":"get_data","id":8})
      .expect('[{"jsonrpc":"2.0","id":8,"result":["hello",5]}]', done);
    })
  })
})