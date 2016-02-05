'use strict';

const express = require('express');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();


module.exports = function (AppController) {
	let router = new express.Router();

	router.get('/', AppController.index);
	router.get('/upload/:id?', AppController.get_upload);
	router.post('/upload/:id?', multipartMiddleware, AppController.post_upload);

	return router;
};
