'use strict';
var express = require('express'),
	bodyParser = require('body-parser'),
	Router = express.Router,
	expressValidator = require('express-validator'),
	jsonParser = bodyParser.json();
module.exports = function (program, app) {
	if (!app) {
		throw new Error('Must provide an express app as argument 2');
	}

	var config = program.config.defaults;

	var router = new Router();

	function Device(obj) {
		return {}
	}

	var devicesLog = program.getLogger('devices');

	var createOrUpdateDevice = function (device) {
		return new Promise(function (resolve, reject) {
			program.db.get(device._id).then(function (resp) {
				if (resp) {
					devicesLog('found device', resp);
					resolve(resp);
				}
			}).catch(function (err) {
				devicesLog('not found', err);
				devicesLog('creating', device);

				program.db.put(device, device._id).then(function (resp) {
					deviceLog('created', resp);
					resolve(device);
				}).catch(reject);
			});
		});
	}

	//Get serial numbers
	router.get('/:deviceLibraryIdentifier/registrations/:passTypeIdentifier?',
		function (req, res) {
			program.log('Push to device ' + req.params);
			res.status(200).send({
				lastUpdated: '',
				serialNumbers: []
			});
		});


	//Send push to device
	router.get('/:deviceLibraryIdentifier/push/:token', function (req, res) {
		program.log('Push to device ' + req.params.token);
		res.status(200).send({
			message: 'Device push token'
		});
	});


	//Unregister Pass
	router.delete('/:deviceLibraryIdentifier/:passTypeIdentifier/:serialNumber', function (req, res) {
		program.log('Register device ' + req.params);
		res.status(200).send(req.params);
	});

	router.post('/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber',
		bodyParser.json(),
		function (req, res) {
			var device = {
				_id: 'device-' + req.params.deviceLibraryIdentifier,
				passTypeIdentifier: req.params.passTypeIdentifier,
				//pushToken: req.body.pushToken,
				serialNumber: req.params.serialNumber,
				data: req.body,
				type: 'device',
				created_at: new Date()
			};

			devicesLog('saveDevice', device);
			createOrUpdateDevice(device).then(function (resp) {
				res.status(200).json({
					data: resp,
					message: 'Register pass on device'
				});
			}).catch(function (err) {
				res.status(400).json(err);
			});
		});


	router.get('/devices', function (req, res) {
		program.db.allDocs({
			startkey: 'device-1',
			endkey: 'device-z',
			include_docs: true
		}).then(function (resp) {
			res.status(200).json(resp);
		}).catch(function (err) {
			res.status(400).json(err);
		});
	});
	app.use('/api/' + config.version + '/devices', router);

};
