'use strict';
const debug = require('debug');

module.exports = function(namespace) {
  var Logger = {};
  Logger.getLogger = function(category) {
    return debug(`${namespace}:${category}`);
  };
  return Logger;
};
