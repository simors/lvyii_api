/**
 * Created by yangyang on 2018/2/21.
 */
'use strict';

var connect = require('connect');
var bodyParser = require('body-parser');
var https = require('https');
var timeout = require('connect-timeout');
var _ = require('underscore');

var LYAPI = require('./init')
var frameworks = require('./frameworks');
var getUploadToken = require('./upload').getUploadToken

var NODE_ENV = process.env.NODE_ENV || 'development';

LYAPI.express = function (options) {
  return frameworks(createRootRouter(options), 'express')
}

function createRootRouter(options) {
  var router = connect();
  
  ['1'].forEach(function(apiVersion) {
    router.use('/' + apiVersion + '/api/', createApiFunctionRouter(options));
  });
  
  return router;
}

function createApiFunctionRouter(options) {
  options = options || {};
  
  var apiFuncs = connect();
  
  apiFuncs.use(timeout(options.timeout || '15s'));
  apiFuncs.use(bodyParser.urlencoded({extended: false, limit: '20mb'}));
  apiFuncs.use(bodyParser.json({limit: '20mb'}));
  apiFuncs.use(bodyParser.text({limit: '20mb'}));
  apiFuncs.use(require('../middleware/cors')());
  
  apiFuncs.use('/fileTokens', fileToken)
  
  apiFuncs.use(function (req, res, next) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.statusCode = 404;
    
    res.end(JSON.stringify({
      code: 1002,
      error: 'Can not find the router'
    }));
  })
  
  apiFuncs.use(function(err, req, res, next) { // jshint ignore:line
    if(req.timeout) {
      console.error(`LvyiiApi: ${req.originalUrl}: function timeout (${err.timeout}ms)`);
      err.code = 124;
      err.message = 'The request timed out on the server.';
    }
    responseError(res, err);
  });
  
  return apiFuncs
}

const fileToken = function (req, res) {
  var key = req.body.key
  var name = req.body.name
  var mime_type = req.body.mime_type
  var metaData = req.body.metaData
  promiseTry(() => {
    var uploader = LYAPI._config.uploader
    if (!uploader) {
      throw new LYAPI.Error(`not init uploader config`, {code: 102})
    }
    var token = getUploadToken(uploader.AK, uploader.SK, uploader.bucket)
    return token
  }).then((response) => {
    responseJson(res, response)
  }).catch(err => {
    responseException(res, req.url, err)
  })
}

function responseJson(res, data) {
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  res.statusCode = 200;
  return res.end(JSON.stringify(data));
}

function responseError(res, err) {
  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  res.statusCode = err.status || err.statusCode || 400;
  res.end(JSON.stringify({
    code: err.code || 1,
    error: err && (err.message || err.responseText || err) || 'null message'
  }));
}

function responseException(res, url, err) {
  var statusCode;
  
  if (err instanceof Error) {
    statusCode = err.status || err.statusCode || 500;
  } else {
    statusCode = 400;
  }
  
  if (statusCode === 500) {
    console.warn(`LvyiiAuth: ${url}: ${statusCode}: ${err.name}: ${err.message}`);
  }
  
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'application/json; charset=UTF-8');
    res.statusCode = statusCode;
    
    res.end(JSON.stringify({
      code: err.code || 1,
      error: err.message || err.responseText || err || 'unknown error'
    }));
  }
}

function promiseTry(func) {
  return new Promise( (resolve, reject) => {
    try {
      Promise.resolve(func()).then(resolve, reject);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = LYAPI;