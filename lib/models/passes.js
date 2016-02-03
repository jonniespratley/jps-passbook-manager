'use strict';

module.exports = function( _, async, SignPass, db, Pass, Logger){
	let logger = Logger.getLogger('Passes');
	let _passes = null;

	class Passes {
		constructor(options){
			logger('Passes constructor', options);
		}

		save(p) {
			return db.put(new Pass(p));
		}

		add(p) {
			return db.put(new Pass(p));
		}

		get(p) {
			return db.get(p);
		}

		remove(p) {
			return db.remove(p);
		}

		getPasses(params) {
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
		}

		/**
		 * Find pass by params
		 * @param params
		 * @returns {*}
		 */
		find(params) {
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
		}

		registerDeviceWithPass(device, pass) {

		}

		findPassesForDevice(device) {

		}

		findPassBySerial(serial) {
			logger('findPassBySerial', serial);
			return this.find({
				docType: 'pass',
				serialNumber: serial
			});
		}
	}

	return new Passes();
};
