var express = require('express')
  , request = require('supertest')
  , jsonrpc = require('../lib/jsonrpc');

describe('jsonrpc', function(){
  var app = express();
  app.use(express.bodyParser());

  describe('.router', function(){
      var app = express();
      app.use(express.bodyParser());

      app.post('/', jsonrpc.router.bind({
        noparams: function(params, respond) {
          respond({result: "hello"})
        },
        ping: function (params, respond) {
          respond({ result: ["hello", params]});
        },
        ping_number: function (params, respond) {
          respond({ result:params});
        },
        error: function (params, respond) {
          respond( jsonrpc.INTERNAL_ERROR );
        },
        get_data: function (params, respond) {
          respond({ result: ["hello", 5] });
        },
        dependant_method: function (params, respond, promises) {
          promises.forEach(function(p) {
            if (p.request.method == 'get_data') {
              p.then(function(result){
                respond({result: result.result[1]+1});
              });
            }
          });
        }
      }));

    it('should route a jsonrpc method', function(done){
      request(app)
      .post('/')
      //.set('Content-Type', 'application/json') //unnecessary since its the default
      .send({"jsonrpc":"2.0","method":"ping","id":8})
      .expect('{"jsonrpc":"2.0","id":8,"result":["hello",null]}', done);
    });

    it('should route a handle false-y looking params correctly', function(done){
      request(app)
      .post('/')
      //.set('Content-Type', 'application/json') //unnecessary since its the default
      .send({"jsonrpc":"2.0","method":"ping_number", "params":0, "id":8})
      .expect('{"jsonrpc":"2.0","id":8,"result":0}', done);
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

    it('should handle dependant methods', function(done){
      request(app)
      .post('/')
      .send([{"jsonrpc":"2.0","method":"get_data", "id":9}, {"jsonrpc":"2.0","method":"dependant_method","id":11}])
      .expect(
    '[{"jsonrpc":"2.0","id":9,"result":["hello",5]},{"jsonrpc":"2.0","id":11,"result":6}]'
        , done);
    });

    it('should timeout with dependant methods without the dependant', function(done){
      var timeout = setTimeout(done, 50); //expect this test to timeout
      request(app)
      .post('/')
      .send({"jsonrpc":"2.0","method":"dependant_method","id":11})
      .expect('should never get a response', done);
    });


  });

})
