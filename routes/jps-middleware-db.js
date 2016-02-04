'use strict';

module.exports = function(DbController, Logger) {
	const Router = require('express').Router;
	const bodyParser = require('body-parser');

	let logger = Logger.getLogger('router:db');
	let dbRouter = new Router();

	dbRouter.route('/:id?', bodyParser.json()).all(function(req, res, next) {
			logger('all route', req.method, req.url, req.params);
			next();
		})
		.get(DbController.get_doc)
		.delete(DbController.delete_doc)
		.put(DbController.put_doc)
		.post(DbController.post_doc);

	dbRouter.use(bodyParser.json());

	return dbRouter;
};
