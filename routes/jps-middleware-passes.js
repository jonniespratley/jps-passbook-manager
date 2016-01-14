'use strict';
var express = require('express'),
	bodyParser = require('body-parser'),
	Router = express.Router,
	jsonParser = bodyParser.json();

module.exports = function(program, app) {
	var logger = program.getLogger('router:passes');
	var config = program.config.defaults;
	var router = new Router();

	var PassController = require('../lib/controllers/passes-controller');
	var passController = new PassController(program);

	router.get('/:pass_type_id/:serial_number', passController.get_passes);
	app.use('/api/' + config.version + '/passes', router);

	return router;
};
