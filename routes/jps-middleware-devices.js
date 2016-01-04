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
	var DevicesController = require('./controllers/devices-controller');
	var devicesController = new DevicesController(program);

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

	//Send push to device
	router.get('/:device_id/push/:token', function(req, res) {
		program.log('Push to device ' + req.params.token);
		res.status(200).send({
			message: 'Device push token'
		});
	});

	//Register Pass
	router.post('/:device_id/registrations/:device_id/:serial_number', bodyParser.json(), devicesController.post_device_registration);

	//Get passes for device
	router.get('/:device_id/registrations/:pass_type_id', devicesController.get_device_passes);

	/*
	# unregister a device to receive push notifications for a pass
	*/
	router.delete('/:device_id/registrations/:pass_type_id/:serial_number', devicesController.delete_device_registration);

	app.use('/api/' + config.version + '/devices', router);

};
