/**
 * Created by yangyang on 2018/1/4.
 */
'use strict';
var _ = require('underscore');

var LYAPI = {}

LYAPI._config = {}

/**
 * appName: 指定应用的名称
 * 初始化方法，其中包含上传服务器的配置uploader，需要包含的字段为
 * {
 *    provider: 服务提供商，目前只支持qiniu
 *    AK: qiniu提供的AK(ACCESS_KEY)
 *    SK: qiniu提供的SK(SECRET_KEY)
 *    bucket: qiniu存储空间名称
 *    region: qiniu存储区域，根据在七牛云上创建存储空间所在的存储区域来填写，可取值为z0,z1,z2,na0,as0
 *    bindDomain: 绑定的存储域名，七牛有默认的测试域名，也可以自己绑定域名
 * }
 * 短信服务sms，需要包含的字段为
 * {
 *    provider: 服务商名称，目前只支持腾讯sms服务，即qcloudsms
 *    appId: 服务商提供的appId
 *    appKey: 服务商制定的secret key
 * }
 * @param options
 * @param params
 */
LYAPI.init = function init(options, ...params) {
  const {
    appName,
    uploader,
    sms,
  } = options
  
  LYAPI._config.appName = appName
  LYAPI._config.uploader = uploader
  LYAPI._config.sms = sms
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