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
	var logger = program.getLogger('router:db')
	var dbRouter = new Router();


	/**
	 * RESTful METHODS:
	 *
	 * HTTP     METHOD          URL
	 * ======|==============|==============================================
	 * GET      findAll         http://localhost:4040/passbookmanager
	 * GET      findById        http://localhost:4040/passbookmanager/passes/:id
	 * POST     add             http://localhost:4040/passbookmanager/passes
	 * PUT      update          http://localhost:4040/passbookmanager/passes/:id
	 * DELETE   destroy         http://localhost:4040/passbookmanager/passes/:id
	 */
	var dbRouter = new Router();
	dbRouter.route('/:db/:id?', bodyParser.json())
		.all(function(req, res, next) {
			// runs for all HTTP verbs first
			// think of it as route specific middleware!
			logger('debug', req.method, req.url);
			//	logger('all route', req.method, req.url, req.params)
			next();
		})
		.get(function(req, res, next) {
			program.db.get(req.params.id, req.params).then(function(resp) {
				res.status(200).json(resp);
			}).catch(function(err) {
				res.status(400).json(err);
			});
		})
		.post(function(req, res, next) {
			// maybe add a new event...
			next();
		});


	dbRouter.get('/:db?', function(req, res, next) {
		program.db.allDocs(req.query).then(function(resp) {
			res.status(200).json(resp);
		}).catch(function(err) {
			res.status(400).json(err);
		});
	});
	dbRouter.post('/:db', bodyParser.json(), function(req, res, next) {

	});
	dbRouter.put('/:db/:id', bodyParser.json(), function(req, res, next) {
		program.db.put(req.body, req.params.id, req.query.rev).then(function(resp) {
			res.status(201).json(resp);
		}).catch(function(err) {
			res.status(400).json(err);
		});
	});

	dbRouter.delete('/:db/:id', function(req, res, next) {
		program.db.remove(req.params.id, req.query.rev).then(function(resp) {
			res.status(200).json(resp);
		}).catch(function(err) {
			res.status(400).json(err);
		});
	});
	app.use(bodyParser.json());

	app.use('/api/' + config.version + '/db', dbRouter);
	app.use('/api/' + config.version + '/db', function(req, res, next) {
		logger(req.method, req.url);
		next();
	});
};
