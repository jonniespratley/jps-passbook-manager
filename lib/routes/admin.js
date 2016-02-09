'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const multipart = require('connect-multiparty');

module.exports = function(program) {
	return function adminRoutes() {

		var multipartMiddleware = multipart();
		program.use(require('../controllers/passes-controller'));
		program.factory('PassesController', require('../controllers/passes-controller'));
		program.factory('AdminController', require('../controllers/admin-controller'));

		const config = program.get('config');
		const app = program.get('app');

		var router = express();
		var adminRouter = express();

		const PassesControler = program.get('PassesController');
		const AdminController = program.get('AdminController');

		adminRouter.get('/passes/:id', PassesController.get_pass);
		adminRouter.put('/passes/:id', jsonParser, PassesController.put_pass);
		adminRouter.post('/passes', jsonParser, PassesController.post_pass);
		adminRouter.delete('/passes/:id', PassesController.delete_pass);
		adminRouter.get('/passes/download/:id', AdminController.get_downloadPass);
		adminRouter.get('/passes/sign/:id', AdminController.get_signPass);

		adminRouter.get('/identifiers/:id', AdminController.get_passTypeIdentifier);
		adminRouter.post('/identifiers/:id', multipartMiddleware, AdminController.post_passTypeIdentifier);
		adminRouter.get('/find?', AdminController.get_find);

		app.use('/' + config.apiBase + '/' + config.version, router);
		router.use('/admin', adminRouter);

		console.log(app.path());
		console.log(router.path());
		console.log(adminRouter.path());

		return adminRouter;

		console.warn('Mounted Admin Routes', config);

	}

};
