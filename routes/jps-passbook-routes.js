'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const Router = express.Router;
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

module.exports = function(program, app) {
	const AppController = program.require('controllers/app-controller');

	let router = new Router();
	let appController = new AppController(program);

	router.get('/', appController.index);
	router.get('/upload/:id?', appController.get_upload);
	router.post('/upload/:id?', multipartMiddleware, appController.post_upload);
	router.post('/log', bodyParser.json(), appController.post_log);
	app.use('/api/' + program.config.defaults.version, router);
};
