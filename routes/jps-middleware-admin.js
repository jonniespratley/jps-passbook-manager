'use strict';
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const multipart = require('connect-multiparty');

module.exports = function(app, Router, PassesController, AdminController) {
	let multipartMiddleware = multipart();
	let adminRouter = new Router();

	adminRouter.get('/passes/:id', PassesController.get_pass);
	adminRouter.put('/passes/:id', jsonParser, PassesController.put_pass);
	adminRouter.post('/passes', jsonParser, PassesController.post_pass);
	adminRouter.delete('/passes/:id', PassesController.delete_pass);
	adminRouter.get('/passes/download/:id', AdminController.get_downloadPass);
	adminRouter.get('/passes/sign/:id', AdminController.get_signPass);
	adminRouter.get('/identifiers/:id', AdminController.get_passTypeIdentifier);
	adminRouter.post('/identifiers/:id', multipartMiddleware, AdminController.post_passTypeIdentifier);

	adminRouter.get('/find?', AdminController.get_find);
	app.use('/api/' + config.version + '/admin', adminRouter);
	return adminRouter;
};
