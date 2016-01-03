'use strict';
const _ = require('lodash');
/*
 * Methods
 * to find the passes that a given device has registered for,
 * to find the devices that have registered for a given pass.
 *
 *  Registration is a many-to-many relationship: a single device can register for updates to multiple passes,
 *  and a single pass can be registered by multiple devices.*/
module.exports = function(db) {

	var Passes = (function() {
		return {
			registerDeviceWithPass: function(device, pass) {

			},
			findDevicesForPass: function(serial) {

			},
			findPassesForDevice: function(device) {

			},
			findPassBySerial: function(serial) {
				console.log('findPassBySerial', serial);
				return new Promise(function(resolve, reject) {
					db.allDocs().then(function(resp) {
						passes = resp.map(function(row) {
							return row.docType === 'pass';
						});
						console.log('got passes', passes);
						resolve(pass);
					});
				});
			}
		}
	})();
	var passes = null;


	/*
	* To handle the device registration, do the following:

	 Verify that the authentication token is correct. If it doesn’t match, immediately return the HTTP status 401 Unauthorized and disregard the request.
	 Store the mapping between the device library identifier and the push token in the devices table.
	 Store the mapping between the pass (by pass type identifier and serial number) and the device library identifier in the registrations table.

	 * */
	return {
		///passes/:passTypeIdentifier/:serialNumber?
		get_passes: function(req, res, next) {
			var self = this;
			var auth = req.get('Authorization');

			console.log('Pass ID', req.params.pass_type_id)
			console.log('Pass serialNumber', req.params.serial_number)
			console.log('Auth header', auth);

			if (!auth) {
				res.status(401).json({
					error: 'No header'
				});
			}
			else {
				Passes.findPassBySerial(req.params.serial_number).then(function(resp) {
					res.send(resp);
				}).catch(function(err) {
					res.status(404).json(err);
				});
			}
		}
	};
};
