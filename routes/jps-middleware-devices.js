'use strict';
var express = require('express'),
	bodyParser = require('body-parser'),
	Router = express.Router;

module.exports = function (program, app) {
	if (!app) {
		throw new Error('Must provide an express app as argument 2');
	}
	var logger = program.getLogger('router:devices');
	var config = program.config.defaults;
	var router = new Router();
	var DevicesController = require('../lib/controllers/devices-controller');
	var devicesController = new DevicesController(program);

	//Send push to device
	router.get('/:device_id/push/:token', function (req, res) {
		logger('Push to device ' + req.params.token);
		res.status(200).send({
			message: 'Device push token'
		});
	});

	router.get('/:device_id/registrations/:pass_type_id?', devicesController.get_device_passes);
	router.post('/:device_id/registrations/:pass_type_id/:serial_number', bodyParser.json(), devicesController.post_device_registration);
	router.delete('/:device_id/registrations/:pass_type_id/:serial_number', devicesController.delete_device_registration);
	app.use('/api/' + config.version + '/devices', router);
};
