'use strict';
module.exports = function(){
  return function(){
    return {
      Device: require('./device'),
      Pass: require('./pass'),
      Passes: require('./passes'),
      Registration: require('./registration'),
      User: require('./user'),
      Users: require('./users')
    };
  };
};
