'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const Router = express.Router;
const path = require('path');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

module.exports = function(program, app) {
	const logger = program.getLogger('router');
	const config = program.config.defaults;
	const AppController = program.require('controllers/app-controller');

	let router = new Router();
	let appController = new AppController(program);


	router.get('/', appController.index);
	router.get('/upload/:id?', appController.get_upload);
	router.post('/upload/:id?', multipartMiddleware, appController.post_upload);
	router.post('/log', bodyParser.json(), appController.post_log);

	var middleware = [
		path.resolve(__dirname, './jps-middleware-auth'),
		path.resolve(__dirname, './jps-middleware-admin'),
		path.resolve(__dirname, './jps-middleware-db'),
		path.resolve(__dirname, './jps-middleware-devices'),
		path.resolve(__dirname, './jps-middleware-passes'),
		path.resolve(__dirname, './jps-middleware-sockets')
	];

	middleware.forEach(function(m) {
		logger('add middleware', m);
		require(m)(program, app);
	});

	app.use('/api/' + config.version, router);
};
