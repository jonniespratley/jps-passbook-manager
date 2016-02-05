'use strict';
const express = require('express');

module.exports = function (PassesController) {
	var router = new express.Router();
	router.get('/:pass_type_id/:serial_number', PassesController.get_passes);

	return router;
};
