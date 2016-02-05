'use strict';
const express = require('express');
const bodyParser = require('body-parser');

module.exports = function (DevicesController) {
	var router = new express.Router();
	router.get('/:device_id/push/:token', function (req, res) {
		logger('Push to device ' + req.params.token);
		res.status(200).send({
			message: 'Device push token'
		});
	});

	router.get('/:device_id/registrations/:pass_type_id?', DevicesController.get_device_passes);
	router.post('/:device_id/registrations/:pass_type_id/:serial_number', bodyParser.json(), DevicesController.post_device_registration);
	router.delete('/:device_id/registrations/:pass_type_id/:serial_number', DevicesController.delete_device_registration);

	return router;
};
