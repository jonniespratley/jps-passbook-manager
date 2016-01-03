'use strict';
/*
 * Methods
 * to find the passes that a given device has registered for,
 * to find the devices that have registered for a given pass.
 *
 *  Registration is a many-to-many relationship: a single device can register for updates to multiple passes,
 *  and a single pass can be registered by multiple devices.*/
module.exports = function (db) {
	var passes = null;


	/*
	* To handle the device registration, do the following:

	 Verify that the authentication token is correct. If it doesn’t match, immediately return the HTTP status 401 Unauthorized and disregard the request.
	 Store the mapping between the device library identifier and the push token in the devices table.
	 Store the mapping between the pass (by pass type identifier and serial number) and the device library identifier in the registrations table.

	 * */
	return {
		registerDeviceWithPass: function(device, pass){

		},
		findDevicesForPass: function(serial){

		},
		findPassesForDevice: function(device){

		},
		findPassBySerial: function (serial) {
			console.log('findPassBySerial', serial);
			return new Promise(function (resolve, reject) {
				db.allDocs().then(function (resp) {
					passes = resp.map(function (row) {
						return row.docType === 'pass';
					});
					console.log('got passes', passes);
					resolve(pass);
				});
			});
		}
	};
};
