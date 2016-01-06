'use strict';
var express = require('express'),
	bodyParser = require('body-parser'),
	Router = express.Router,
	jsonParser = bodyParser.json();

module.exports = function(program, app) {
	if (!app) {
		throw new Error('Must provide an express app as argument 2');
	}
	var logger = program.getLogger('router:passes');
	var config = program.config.defaults;
	var router = new Router();

	var PassController = require('../lib/controllers/passes-controller');
	var passController = new PassController(program);


	// TODO: Admin Routes
	var adminRouter = new Router();
	adminRouter.get('/?', passController.get_all_passes);
	adminRouter.post('/', jsonParser, passController.post_pass);
	adminRouter.put('/:id', jsonParser, passController.put_pass);
	adminRouter.delete('/:id', passController.delete_pass);
	adminRouter.get('/:id?', passController.get_pass);

	app.use('/api/' + config.version + '/admin/passes', adminRouter);


	router.get('/:pass_type_id/:serial_number?', passController.get_passes);
	app.use('/api/' + config.version + '/passes', router);
	app.all('/api/' + config.version + '/passes/*', function(req, res, next) {
		logger(req.method, req.url);
		next();
	});
	return router;
};
