'use strict';
const assert = require('assert');
const Logger = require('./')('nodejs-sandbox');
var log = null;
describe('Logger', function() {

  it('should be defined', function() {
    assert(Logger);
  });

  it('getLogger(category) - should return logging instance.', function() {
    assert(Logger.getLogger);
    log = Logger.getLogger('spec');
    log('this is from a spec');

    assert(log);
  });

});
