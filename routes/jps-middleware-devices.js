'use strict';
var express = require('express'),
	bodyParser = require('body-parser'),
	Router = express.Router,
	expressValidator = require('express-validator'),
	jsonParser = bodyParser.json();



module.exports = function(program, app) {
	if (!app) {
		throw new Error('Must provide an express app as argument 2');
	}

	var config = program.config.defaults;

	var router = new Router();

	function Device(obj) {
		return {}
	}

	var devicesLog = program.getLogger('devices');

	var createOrUpdateDevice = function(device) {
		return new Promise(function(resolve, reject) {
			program.db.get(device._id).then(function(resp) {
				if (resp) {
					devicesLog('found device', resp);
					resolve(resp);
				}
			}).catch(function(err) {
				devicesLog('not found', err);
				devicesLog('creating', device);

				program.db.put(device).then(function(resp) {
					deviceLog('created', resp);
					resolve(device);
				}).catch(reject);
			});
		});
	}

	//Get serial numbers
	router.get('/:deviceLibraryIdentifier/registrations/:passTypeIdentifier?',
		function(req, res) {
			program.log('Push to device ' + req.params);
			res.status(200).send({
				lastUpdated: '',
				serialNumbers: []
			});
		});


	//Send push to device
	router.get('/:deviceLibraryIdentifier/push/:token', function(req, res) {
		program.log('Push to device ' + req.params.token);
		res.status(200).send({
			message: 'Device push token'
		});
	});


	//Unregister Pass
	router.delete('/:deviceLibraryIdentifier/:passTypeIdentifier/:serialNumber', function(req, res) {
		program.log('Register device ' + req.params);
		res.status(200).send(req.params);
	});

	router.post('/:device_id/registrations/:pass_type_id/:serial_number',
		bodyParser.json(),
		function(req, res) {
			var auth = req.get('Authorization');

			if (!auth) {
				return res.status(401).json({
					error: 'Unauthorized'
				});
			}

			var device = {
				_id: req.params.device_id + '-' + req.params.serial_number,
				passTypeIdentifier: req.params.pass_type_id,
				pushToken: req.body.pushToken,
				serialNumber: req.params.serial_number,
				data: req.body,
				type: 'device',
				created_at: new Date()
			};

			console.log('saveDevice', device);
			createOrUpdateDevice(device).then(function(resp) {
				res.status(200).json({
					data: resp,
					message: 'Register pass on device'
				});
			}).catch(function(err) {
				res.status(400).json(err);
			});
		});



	app.use('/api/' + config.version + '/devices', router);

};
