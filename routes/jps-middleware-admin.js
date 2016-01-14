'use strict';
var express = require('express'),
	bodyParser = require('body-parser'),
	Router = express.Router,
	jsonParser = bodyParser.json();

module.exports = function(program, app) {
	var logger = program.getLogger('router:admin');
	var config = program.config.defaults;

	var PassController = require('../lib/controllers/passes-controller');
	var passController = new PassController(program);

	var adminRouter = new Router();
	adminRouter.get('/', passController.get_all_passes);
	adminRouter.get('/find?', passController.get_find_pass);
	adminRouter.post('/', jsonParser, passController.post_pass);
	adminRouter.put('/:id', jsonParser, passController.put_pass);
	adminRouter.delete('/:id', passController.delete_pass);
	adminRouter.get('/:id', passController.get_pass);
	app.use('/api/' + config.version + '/admin/passes', adminRouter);

	return adminRouter;
};
