'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();

module.exports = function(app, config, AppController) {
	let router = new express.Router();


	router.get('/', AppController.index);
	router.get('/upload/:id?', AppController.get_upload);
	router.post('/upload/:id?', multipartMiddleware, AppController.post_upload);
	router.post('/log', bodyParser.json(), AppController.post_log);
	app.use('/api/' + config.version, router);
};
