'use strict';
const express = require('express');
const multipart = require('connect-multiparty');
const assert = require('assert');
const path = require('path');

module.exports = function(program) {
	//program.factory('AuthService', path.resolve(__dirname, './services/auth-service'));
	const app = program.get('app');
	const config = program.get('config');
	const AppController = program.get('AppController');

	var router = express();
	program.factory('AppRouter', path.resolve(__dirname, './routes/index'));
	program.factory('AdminRouter', path.resolve(__dirname, './routes/admin'));
	program.factory('AuthRouter', path.resolve(__dirname, './routes/auth'));
	program.factory('DeviceRouter', path.resolve(__dirname, './routes/devices'));
	program.factory('LogRouter', path.resolve(__dirname, './routes/logs'));
	program.factory('PassRouter', path.resolve(__dirname, './routes/passes'));


	router.get('/', AppController.index);
	router.get('/upload/:id?', AppController.get_upload);
	router.post('/upload/:id?', multipart(), AppController.post_upload);

	router.use('/auth', this.get('AuthRouter'));
	router.use('/devices', this.get('DeviceRouter'));
	router.use('/log', this.get('LogRouter'));
	router.use('/passes', this.get('PassRouter'));
	router.use('/admin', this.get('AdminRouter'));

	//app.use('/', router);
	app.use('/api/' + config.version, router);
	return router;

};
