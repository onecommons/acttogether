var express = require('express')
  , request = require('supertest')
  , jsonrpc = require('jsonrpc');

describe('jsonrpc', function(){
  describe('.router', function(){
      var app = express();
      app.use(express.bodyParser());

      app.post('/', function (req, res, next) {
        jsonrpc.router(req, res, next, {
          get_data: function (params, respond) {
            respond({ result: ["hello", 5] });
          } 
        });
      });

    it('should route a jsonrpc method', function(done){
      request(app)
      .post('/')
      //.set('Content-Type', 'application/json') //unnecessary since its the default
      .send({"jsonrpc":"2.0","method":"get_data","id":8})
      .expect('{"jsonrpc":"2.0","id":8,"result":["hello",5]}', done);
    });

    it('should handle batch requests', function(done){
      request(app)
      .post('/')
      //.set('Content-Type', 'application/json') //unnecessary since its the default
      .send([{"jsonrpc":"2.0","method":"get_data","id":9}, {"jsonrpc":"2.0","method":"get_data"}, {"jsonrpc":"2.0","method":"get_data","id":10}])
      .expect('[{"jsonrpc":"2.0","id":9,"result":["hello",5]},{"jsonrpc":"2.0","id":10,"result":["hello",5]}]', done);
    });

    it('should send an empty response to a notification', function(done){
      request(app)
      .post('/')
      //.set('Content-Type', 'application/json') //unnecessary since its the default
      .send({"jsonrpc":"2.0","method":"get_data"})
      .expect('', done);
    });

  });
})