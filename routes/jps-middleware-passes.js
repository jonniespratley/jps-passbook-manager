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

	var PassController = require('../lib/controllers/passes-controller');
	var passController = new PassController(program.db);

	/*
	 # Pass delivery
	 #
	 # GET /v1/passes/<pass_type_id>/<serial_number#>
	 # Header: Authorization: ApplePass <authenticationToken>
	 #
	 # server response:
	 # --> if auth token is correct: 200, with pass data payload
	 # --> if auth token is incorrect: 401
	 #
	 */
	router.get('/:pass_type_id/:serial_number?', passController.get_passes);


	//Handle saving new passes
	router.post('/', jsonParser, passController.post_pass)
	router.put('/:id', jsonParser, passController.put_pass)
	router.delete('/:id', passController.delete_pass)
	router.get('/:id', passController.get_pass)

	app.use('/api/' + config.version + '/passes', router);
	return router;
};
