'use strict';
const express = require('express');

module.exports = function (program) {
	const app = program.get('app');

	var router = express();

	console.log('api routes');

	router.get('/', function (req, res, next) {
		if (!req.query._token) {
			console.error('no token');
			return next(new Error('No token was provided.'));
		}
	}, function (req, res, next) {
		res.render('admin');
	});

	router.all('*', function (req, res, next) {
		console.log('*', req.url);
		if (!req.query.api_key) {
			return next(new Error('No API key was provided.'));
		}
	});

	router.use(function (req, res, next) {
		console.log('api Router', req.method, req.url);
		next();
	});


	app.use('/api/*', router);

	return router;

};
