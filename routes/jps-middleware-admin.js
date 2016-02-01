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

	adminRouter.get('/', passController.get_all_passes);
	adminRouter.post('/', jsonParser, passController.post_pass);

	adminRouter.get('/find?', passController.get_find_pass);
	adminRouter.put('/:id', jsonParser, passController.put_pass);
	adminRouter.delete('/:id', passController.delete_pass);
	adminRouter.get('/:id', passController.get_pass);


	adminRouter.get('/download/:id', adminController.get_downloadPass);
	adminRouter.get('/sign/:id', adminController.get_signPass);
	adminRouter.post('/passTypeIdentifier/:id', multipartMiddleware, adminController.post_passTypeIdentifier);
	app.get('/api/' + config.version + '/admin/find?', adminController.get_find);
	app.use('/api/' + config.version + '/admin/passes', adminRouter);

	return adminRouter;
};
