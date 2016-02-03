'use strict';

module.exports = function(config, app, Router, Logger, DbController) {
	const bodyParser = require('body-parser');

	let logger = Logger.getLogger('router:db')
	let dbRouter = new Router();
	let dbController = new DbController(program);

	dbRouter.route('/:id?', bodyParser.json()).all(function(req, res, next) {
			logger('debug', req.method, req.url);
			logger('all route', req.method, req.url, req.params)
			next();
		})
		.get(dbController.get_doc)
		.delete(dbController.delete_doc)
		.put(dbController.put_doc)
		.post(dbController.post_doc);

	dbRouter.use(bodyParser.json());

	app.use('/api/' + config.version + '/db', dbRouter);

	return dbRouter;
};
