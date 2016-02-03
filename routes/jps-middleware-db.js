'use strict';

module.exports = function(program, app) {

	const express = require('express');
	const Router = express.Router;
	//const expressValidator = require('express-validator');
	const bodyParser = require('body-parser');
	const jsonParser = bodyParser.json();

	const DbController = program.require('controllers/db-controller');


	let config = program.config.defaults;
	let logger = program.getLogger('router:db')
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

	app.use(bodyParser.json());
	app.use('/api/' + config.version + '/db', dbRouter);
};
