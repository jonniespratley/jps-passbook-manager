'use strict';
const express = require('express');

module.exports = function (app) {

	var router = new express.Router();
	console.log('auth routes');


	router.use(function (req, res, next) {
		console.log('Auth Router', req.method, req.url);
		next();
	});

	router.get('/admin', function (req, res) {
		console.log('admin route', req.url);

		res.status(200).json({
			message: 'Welcome to admin'
		});
	});


	app.use('/', router);

	return router;


};
