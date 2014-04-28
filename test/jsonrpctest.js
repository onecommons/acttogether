var express = require('express')
  , request = require('supertest')
  , jsonrpc = require('../lib/jsonrpc');

describe('jsonrpc', function(){
  var app = express();
  app.use(express.bodyParser());

  describe('.router', function(){
      var app = express();
      app.use(express.bodyParser());

      app.post('/', function (req, res, next) {
        jsonrpc.router(req, res, next, {
          noparams: function(params, respond) {
            respond({result: "hello"})
          },
          ping: function (params, respond) {
            respond({ result: ["hello", params] });
          },
          error: function (params, respond) {
            respond( jsonrpc.INTERNAL_ERROR );
          },
          get_data: function (params, respond) {
            respond({ result: ["hello", 5] });
          }
        });
      });

    it('should route a jsonrpc method', function(done){
      request(app)
      .post('/')
      //.set('Content-Type', 'application/json') //unnecessary since its the default
      .send({"jsonrpc":"2.0","method":"ping","id":8})
      .expect('{"jsonrpc":"2.0","id":8,"result":["hello",null]}', done);
    });

    it('should handle internal errors correctly', function(done){
      request(app)
      .post('/')
      //.set('Content-Type', 'application/json') //unnecessary since its the default
      .send({"jsonrpc":"2.0","method":"error","id":8})
      .expect( '{"jsonrpc":"2.0","id":8,"error":{"code":-32603,"message":"Internal error"}}', done);
    });

    it('should handle no such method errors correctly', function(done){
      request(app)
      .post('/')
      //.set('Content-Type', 'application/json') //unnecessary since its the default
      .send({"jsonrpc":"2.0","method":"doesntexist","id":8})
      .expect( '{"jsonrpc":"2.0","id":8,"error":{"code":-32601,"message":"Method not found"}}', done);
    });

    it('should handle batch requests', function(done){
      request(app)
      .post('/')
      //.set('Content-Type', 'application/json') //unnecessary since its the default
      .send([{"jsonrpc":"2.0","method":"ping",params:["foo"],"id":9}, {"jsonrpc":"2.0","method":"get_data"}, {"jsonrpc":"2.0","method":"ping",params:{named:1},"id":10}, {"jsonrpc":"2.0","method":"noparams","id":11}])
      .expect(
 '[{"jsonrpc":"2.0","id":9,"result":["hello",["foo"]]},{"jsonrpc":"2.0","id":10,"result":["hello",{"named":1}]},{"jsonrpc":"2.0","id":11,"result":"hello"}]'
        , done);
    });

    it('should send an empty response to a notification', function(done){
      request(app)
      .post('/')
      //.set('Content-Type', 'application/json') //unnecessary since its the default
      .send({"jsonrpc":"2.0","method":"get_data"})
      .expect('', done);
    });

    it('should send an empty response to an error generating notification', function(done){
      request(app)
      .post('/')
      //.set('Content-Type', 'application/json') //unnecessary since its the default
      .send({"jsonrpc":"2.0","method":"doesntexist"})
      .expect('', done);
    });

  });

})