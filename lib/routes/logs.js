'use strict';
const express = require('express');
const bodyParser = require('body-parser');

module.exports = function(AppController){
	var router = new express.Router();

	router.post('/log', bodyParser.json(), AppController.post_log);
	console.log('logs routes');

	return router;
};
