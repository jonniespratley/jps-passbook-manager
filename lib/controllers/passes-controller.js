'use strict';
const assert = require('assert');
const _ = require('lodash');
var Pass = require('../models/pass');
/*
 * Methods
 * to find the passes that a given device has registered for,
 * to find the devices that have registered for a given pass.
 *
 *  Registration is a many-to-many relationship: a single device can register for updates to multiple passes,
 *  and a single pass can be registered by multiple devices.*/
module.exports = function(program) {
	var db = program.db;
	var logger = program.getLogger('controller:passes');
	var Passes = (function() {
		var _passes = null;

		return {
			findPass: function(params) {
				logger('findPass', params);
				return new Promise(function(resolve, reject) {
					db.allDocs().then(function(resp) {
						_passes = resp.rows.map(function(row) {
							return row.docType === 'pass';
						});
						resolve(_.where(_passes, params));
					});
				});
			},
			registerDeviceWithPass: function(device, pass) {

			},
			findDevicesForPass: function(serial) {

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
					});
				});
			}
		}
	})();



	/*
	 * To handle the device registration, do the following:

	 Verify that the authentication token is correct. If it doesn’t match, immediately return the HTTP status 401 Unauthorized and disregard the request.
	 Store the mapping between the device library identifier and the push token in the devices table.
	 Store the mapping between the pass (by pass type identifier and serial number) and the device library identifier in the registrations table.
	 */
	return {

		get_passes: function(req, res) {
			var self = this;
			var auth = req.get('Authorization');
			var pass_type_id = req.params.pass_type_id;
			var serial_number = req.params.serial_number;

			//assert.ok(pass_type_id, 'has pass type id');

			logger('Handling pass delivery request...');
			logger('Authorization=', auth);
			logger('pass_type_id=', pass_type_id);
			logger('serial_number=', serial_number);

			if (!auth) {
				logger('findPassBySerial:unauthorized');
				return res.status(401).json({
					error: 'Unauthorized'
				});

			} else {

				Passes.findPass({
					passTypeIdentifier: pass_type_id,
					serialNumber: serial_number
				}).then(function(resp) {
					logger('findPassBySerial:success', resp);
					res.status(200).send(resp);
				}).catch(function(err) {
					logger('findPassBySerial:error', err);
					res.status(404).json(err);
				});
			}
		},
		/**
		 * I handle creating a new pass document
		 * @param req
		 * @param res
		 * @param next
		 */
		post_pass: function(req, res) {
			var p = new Pass(req.body);
			db.put(p).then(function(resp) {
				res.status(201).send(resp);
			}).catch(function(err) {
				res.status(404).json(err);
			});
		},
		put_pass: function(req, res) {
			var p = new Pass(req.body);
			var id = req.params.id
			p._id = id;
			db.put(p, id).then(function(resp) {
				res.status(200).send(resp);
			}).catch(function(err) {
				res.status(404).json(err);
			});
		},
		get_pass: function(req, res) {
			var id = req.params.id
			db.get(id).then(function(resp) {
				res.status(200).send(resp);
			}).catch(function(err) {
				res.status(404).json(err);
			});
		},
		delete_pass: function(req, res) {
			var id = req.params.id
			db.remove(id).then(function(resp) {
				res.status(200).send(resp);
			}).catch(function(err) {
				res.status(404).json(err);
			});
		}
	};
};
