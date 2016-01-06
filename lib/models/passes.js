'use strict';
var db = require('../db').getInstance();
var Pass = require('./pass');
var utils = require('../utils');
var _ = require('lodash');
var logger = utils.getLogger('passes');
var Passes = (function() {
  var _passes = null;

  return {
    add: function(p) {
      return db.put(new Pass(p));
    },
    get: function(p) {
      return db.get(p);
    },
    remove: function(p) {
      return db.remove(p);
    },
    /**
     * Get all passes
     * @param params
     * @returns {*}
     */
    getPasses: function(params) {
      let __passes = [];
      return new Promise(function(resolve, reject) {
        db.allDocs().then(function(resp) {
          __passes = resp.rows.filter(function(row) {
            return row.docType === 'pass';
          });
          resolve(__passes);
        }).catch(reject);
      });
    },
    /**
     * Find pass by params
     * @param params
     * @returns {*}
     */
    find: function(params) {
      logger('find', params);
      return new Promise(function(resolve, reject) {
        db.allDocs().then(function(resp) {
          resolve(_.where(resp.rows, params));
        }).catch(reject);
      });
    },
    registerDeviceWithPass: function(device, pass) {

    },
    findPassesForDevice: function(device) {

    },
    findPassBySerial: function(serial) {
      logger('findPassBySerial', serial);
      return new Promise(function(resolve, reject) {
        db.allDocs().then(function(resp) {
          _passes = resp.map(function(row) {
            return row.docType === 'pass';
          });
          logger('got passes', _passes);
          resolve(pass);
        }).catch(reject);
      });
    }
  }
})();
module.exports = Passes;
