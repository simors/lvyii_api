/**
 * Created by yangyang on 2018/2/22.
 */
module.exports = function () {
  const hexOctet = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  
  this.guid = function() {
    return hexOctet() + hexOctet() + hexOctet() + hexOctet()
  }
}