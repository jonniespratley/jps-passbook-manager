'use strict';
const express = require('express');

module.exports = function (program) {
	var PassesController = program.get('PassesController');
	var router = new express.Router();
	router.get('/:pass_type_id/:serial_number', PassesController.get_passes);
	return router;
};
