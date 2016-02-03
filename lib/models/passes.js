'use strict';
const db = require('../db').getInstance();
const Pass = require('./pass');
const utils = require('../utils');
const _ = require('lodash');
const async = require('async');
const logger = utils.getLogger('passes');
const SignPass = require('../signpass');

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
			params = _.assign({
				docType: 'pass'
			}, params);

			return new Promise(function(resolve, reject) {
				db.allDocs(params).then(function(resp) {
					__passes = _.where(resp.rows, params);
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
				_.defer(function() {
					async.waterfall([
						function _getPasses(callback) {
							self.getPasses(params).then(function(resp) {
								callback(null, resp);
							}).catch(function(err) {
								callback(err, null);
							});
						},
						function _findPass(passes, callback) {
							pass = _.find(passes, params);
							if (pass) {
								callback(null, pass);
							} else {
								callback('No pass', null);
							}
						}
					], function(err, result) {
						if (err) {
							reject({
								error: 'Pass not found',
								query: params
							});
						} else {
							resolve(result);
						}
						console.log('find', result);
					});

				});

			});
		},
		registerDeviceWithPass: function(device, pass) {

		},
		findPassesForDevice: function(device) {

		},
		findPassBySerial: function(serial) {
			logger('findPassBySerial', serial);
			return this.find({
				docType: 'pass',
				serialNumber: serial
			});
		}
	};
})();
module.exports = Passes;
