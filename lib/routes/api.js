'use strict';
const express = require('express');

module.exports = function (program) {
	console.log('routes/api', 'initialized');

	const app = program.get('app');
	const router = new express.Router();

	console.log('routes/api', 'mounted');

	router.use(function (req, res, next) {
		console.log('api Router', req.method, req.url);
		next();
	});

	router.all('/api/v1', function (req, res, next) {
		console.log('*', req.url);
		next();
	});

	router.get('/api/v1', function (req, res, next) {
		res.status(200).json({
			message: 'api route'
		});
	});


	app.use('/', router);

	return router;
};
