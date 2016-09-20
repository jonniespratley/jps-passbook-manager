'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const Router = express.Router;
const jsonParser = bodyParser.json();
const multipart = require('connect-multiparty');

module.exports = function(program, app) {
	const logger = program.getLogger('router:admin');
	const config = program.config.defaults;
	const AdminController = program.require('controllers/admin-controller');
	const PassController = program.require('controllers/passes-controller');

	let multipartMiddleware = multipart();
	let adminRouter = new Router();
	let adminController = new AdminController(program);
	let passController = new PassController(program);

	adminRouter.get('/passes/:id', passController.get_pass);
	adminRouter.put('/passes/:id', jsonParser, passController.put_pass);
	adminRouter.post('/passes', jsonParser, passController.post_pass);
	adminRouter.delete('/passes/:id', passController.delete_pass);
	adminRouter.get('/passes/download/:id', adminController.get_downloadPass);
	adminRouter.get('/passes/sign/:id', adminController.get_signPass);
	//adminRouter.get('/identifiers', adminController.get_passTypeIdentifier);
	adminRouter.get('/identifiers/:id?', adminController.get_passTypeIdentifier);
	adminRouter.post('/identifiers/:id', multipartMiddleware, adminController.post_passTypeIdentifier);
	adminRouter.put('/identifiers/:id', multipartMiddleware, adminController.post_passTypeIdentifier);

	adminRouter.get('/find?', adminController.get_find);

	app.use('/api/' + config.version + '/admin', adminRouter);

	return adminRouter;
};
