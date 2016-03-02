'use strict';
const express = require('express');
const multipart = require('connect-multiparty');
const assert = require('assert');
const path = require('path');

module.exports = function(program) {
	if (!program) {
		throw new Error('Must provide program')
	}
	//program.factory('AuthService', path.resolve(__dirname, './services/auth-service'));
	const app = program.get('app');
	const config = program.get('config');
	const AppController = program.get('AppController');

	var router = express();
	var routes = [{
		name: 'AppRouter',
		file: path.resolve(__dirname, './routes/index')
	}];

	program.plugin('AppRouter', path.resolve(__dirname, './routes/index'));
	program.plugin('AdminRouter', path.resolve(__dirname, './routes/admin'));
	program.plugin('AuthRouter', path.resolve(__dirname, './routes/auth'));
	program.plugin('DeviceRouter', path.resolve(__dirname, './routes/devices'));
	program.plugin('LogRouter', path.resolve(__dirname, './routes/logs'));
	program.plugin('PassRouter', path.resolve(__dirname, './routes/passes'));

	router.get('/', AppController.index);
	router.get('/upload/:id?', AppController.get_upload);
	router.post('/upload/:id?', multipart(), AppController.post_upload);

	//router.use('/auth', program.get('AuthRouter'));
	//router.use('/devices', program.get('DeviceRouter'));
	//router.use('/log', program.get('LogRouter'));
	//router.use('/passes', program.get('PassRouter'));
	//router.use('/admin', program.get('AdminRouter'));

	//app.use('/', router);
	app.use('/api/' + config.version, router);

	return router;
};
