/**
 * Created by yangyang on 2018/2/21.
 */
const qiniu = require("qiniu");

const getUploadToken = function(accessKey, secretKey, bucket) {
  var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  
  //简单上传凭证
  var options = {
    scope: bucket,
    returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
  };
  var putPolicy = new qiniu.rs.PutPolicy(options);
  return putPolicy.uploadToken(mac);
}

module.exports = {
  getUploadToken: getUploadToken
}