var Promise = require('promise');

  var PARSE_ERROR = -32700,
    INVALID_REQUEST = -32600,
    METHOD_NOT_FOUND = -32601,
    INVALID_PARAMS = -32602,
    INTERNAL_ERROR = -32603;

/** @constant */
var ERROR_CODES = {
  'PARSE_ERROR': PARSE_ERROR,
  'INVALID_REQUEST': INVALID_REQUEST,
  'METHOD_NOT_FOUND': METHOD_NOT_FOUND,
  'INVALID_PARAMS': INVALID_PARAMS,
  'INTERNAL_ERROR': INTERNAL_ERROR
},
/** @constant */
ERROR_MESSAGES = {
  '-32700': 'Parse error',
  '-32600': 'Invalid request',
  '-32601': 'Method not found',
  '-32602': 'Invalid parameters',
  '-32603': 'Internal error'
  //-32099 to -32000 are open for use
};

function makeErrorObject( params ) {
  var id, code, message, data,
    errorObj = {
      jsonrpc: '2.0'
    };

  if ( typeof params === 'object' ) {
    id = ( typeof params.id !== 'undefined' ) ? params.id : null;
    code = parseInt( params.code, 10 );
    code = ( params.code >= -32700 && params.code <= -32000 )
      ? code
      : INTERNAL_ERROR;
    message = params.message || ERROR_MESSAGES[ code ];
    data = params.data;
  }

  errorObj.id = id;
  errorObj.error = {
    code: code,
    message: message,
    data: data
  };

  return errorObj;
};

function isValidRequest(rpc) {
  //or params must be absent, an array or object
  var params = rpc.params;
  //isNaN shouldn't be used for rpc.id
  return rpc.jsonrpc === '2.0' && typeof rpc.method ==='string' && (!rpc.hasOwnProperty('id') || typeof rpc.id === 'number')
    && (!params || Array.isArray(params) || typeof params === 'object'); //last check is redundant for simple requests
}

function setup(body, methods, nodeReq) {
  var reqs = Array.isArray(body) ? body : [body];
  return reqs.reduce(function(promisesSoFar, req) {
    var p = null;
    if (!isValidRequest(req)) {
      p = Promise.resolve(makeResult(req, INVALID_REQUEST));
    } else {
      var method = methods[req.method];
      if (!method) {
        p = Promise.resolve(makeResult(req, METHOD_NOT_FOUND));
      } else {
        p = new Promise(function (resolve, reject) {
          try {
            method.call(methods, req.params, function(response) {
              resolve(makeResult(req, response));
            }, promisesSoFar.slice(0), nodeReq); //copy array to record current state in order to avoid deadlock
          } catch (e) {
              console.log("unexpected error from jsonrpc method call:", req.method, req.params);
              console.dir(e);
              resolve(makeResult(req, INTERNAL_ERROR));
          }
        });
      }
    }
    p.request = req;
    promisesSoFar.push(p);
    return promisesSoFar;
  }, []);
}

function makeResult(request, responseObj) {
  if (!request.hasOwnProperty('id')) //it's a notification
    return null;
  var response = {}, code, message, data;
  var id = request.id;
  // .result means it's a success
  if (typeof responseObj.result !== 'undefined') {
    response = {
      jsonrpc: '2.0',
      id: id,
      result: responseObj.result
    };
  }
  // otherwise it's an error
  else {
    if ( typeof responseObj.error === 'object' ) {
      code = responseObj.error.code;
      message = responseObj.error.message;
      data = responseObj.error.data;
    }
    else if ( typeof ( code = parseInt( responseObj, 10 ) ) === 'number' ) {
      message = ERROR_MESSAGES[ code ];
    }
    else {
      code = INTERNAL_ERROR;
      message = ERROR_MESSAGES[ code ];
      data = responseObj;
    }

    response = makeErrorObject( { id: id, code: code, message: message, data: data } );
  }
  return response;
}

module.exports.router = function(req, res, next, methods, stringify, oncomplete) {
  if (req.headers['content-type'].indexOf( 'application/json' ) > -1) {
   var isBatch = Array.isArray(req.body);
   Promise.all(setup(req.body, methods, req)).then(
    function (result) {
        //filter out notification results
        result = result.filter(function(elem){return !!elem;});
        if (!result.length) {
          res.end();
          return;
        }
        if (!isBatch && result.length == 1)
          result = result[0];
        var rpcResponse = (stringify || JSON.stringify)(result);
        var contentLength = Buffer.byteLength(rpcResponse);
        res.writeHead(contentLength ? 200 : 204, {
          'Content-Length': String(contentLength),
          'Content-Type': req.contentType
        });
        res.end(rpcResponse);
        if (oncomplete) oncomplete(result);
    }
    /*, function (rejectedReason) { //XXX
      writeResponse(rpcError(), res);
    }*/).done();
  } else {
    next();
  }
}

module.exports.PARSE_ERROR = PARSE_ERROR;
module.exports.INVALID_REQUEST = INVALID_REQUEST;
module.exports.METHOD_NOT_FOUND = METHOD_NOT_FOUND;
module.exports.INVALID_PARAMS = INVALID_PARAMS;
module.exports.INTERNAL_ERROR = INTERNAL_ERROR;
