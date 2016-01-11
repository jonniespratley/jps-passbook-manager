'use strict';
var db = require('../db').getInstance();
var Pass = require('./pass');
var utils = require('../utils');
var _ = require('lodash');
var logger = utils.getLogger('passes');
var Passes = (function() {
	var _passes = null;

	return {
		save: function(p) {
			return db.put(new Pass(p));
		},
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
				db.allDocs(params).then(function(resp) {
					resp.rows.forEach(function(row) {
						if (row.docType === 'pass') {
							//__passes.push(new Pass(row));
							__passes.push(row);
						}
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
			var self = this,
				pass = null;

			logger('find', params);
			return new Promise(function(resolve, reject) {
				self.getPasses(params).then(function(resp) {
					logger('find', resp);
						pass = _.find(resp, params);
					if (pass) {
						resolve(pass);
					} else {
						reject({
							error: 'Pass not found',
							query: params
						});
					}

				}).catch(reject);
			});
		},
		registerDeviceWithPass: function(device, pass) {

		},
		findPassesForDevice: function(device) {

		},
		findPassBySerial: function(serial) {
			logger('findPassBySerial', serial);
			return this.find({
				serialNumber: serial
			});
		}
	};
})();
module.exports = Passes;
