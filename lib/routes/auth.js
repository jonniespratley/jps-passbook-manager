'use strict';
const express = require('express');

module.exports = function(app) {

	var router = new express.Router();
	console.log('auth routes');

	router.get('/admin', function(req, res, next) {
		if (!req.query._token) {
			return next(new Error('No token was provided.'));
		}
	}, function(req, res, next) {
		res.render('admin');
	});

	// Middleware that applied to all /api/* calls
	router.use('/api/*', function(req, res, next) {
		if (!req.query.api_key) {
			return next(new Error('No API key was provided.'));
		}
	});

	router.use(function(req, res, next) {
		console.log('Auth Router', req.method, req.url);
		next();
	});

	router.get('/admin', function(req, res) {
		console.log('admin route', req.url);

		res.status(200).json({
			message: 'Welcome to admin'
		});
	});


	app.use('/', router);

	return router;


};
