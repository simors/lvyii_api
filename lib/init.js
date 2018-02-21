/**
 * Created by yangyang on 2018/1/4.
 */
'use strict';
var _ = require('underscore');

var LYAPI = {}

LYAPI._config = {}

/**
 * 初始化方法，其中包含上传服务器的配置uploader，需要包含的字段为
 * {
 *    provider: 服务提供商，目前只支持qiniu
 *    AK: qiniu提供的AK(ACCESS_KEY)
 *    SK: qiniu提供的SK(SECRET_KEY)
 *    bucket: qiniu存储空间名称
 * }
 * @param options
 * @param params
 */
LYAPI.init = function init(options, ...params) {
  const {
    uploader,
  } = options
  
  LYAPI._config.uploader = uploader
}

LYAPI.Error = class LYAPIError extends Error {
  constructor(message, extra) {
    super()
    
    extra = extra || {}
    
    if (!extra.status) {
      extra.status = 400;
    }
    
    _.extend(this, {
      name: 'CloudError',
      message: message
    }, extra)
    
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = LYAPI