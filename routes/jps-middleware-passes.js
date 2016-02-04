'use strict';
const express = require('express');

module.exports = function(PassesController) {
	return function(){
		var router = new express.Router();
		router.get('/:pass_type_id/:serial_number', PassesController.get_passes);

		//app.use('/api/' + config.version + '/passes', router);

		return router;
	};
};
