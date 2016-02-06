'use strict';
const express = require('express');
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart();
const assert = require('assert');
const path = require('path');


module.exports = function(app) {


	//program.factory('AuthService', path.resolve(__dirname, './services/auth-service'));
	const program = app.get('program');

	/*	program.factory('AppRouter', path.resolve(__dirname, './routes/index'));
		program.factory('AdminRouter', path.resolve(__dirname, './routes/admin'));
		program.factory('AuthRouter', path.resolve(__dirname, './routes/auth'));
		program.factory('DeviceRouter', path.resolve(__dirname, './routes/devices'));
		program.factory('LogRouter', path.resolve(__dirname, './routes/logs'));
		program.factory('PassRouter', path.resolve(__dirname, './routes/passes'));
	*/
	var server = program.get('server');
	var router = new express.Router();

	const AppController = program.get('AppController');

	router.get('/', AppController.index);
	router.get('/upload/:id?', AppController.get_upload);
	router.post('/upload/:id?', multipartMiddleware, AppController.post_upload);

	//const Routes = this.get('Routes');
	//let router = new Routes();

	//Mount rotues

	/*
		router.use('/api/' + program.get('config').version, this.get('AppRouter'));
		router.use('/api/' + program.get('config').version, this.get('AuthRouter'));
		router.use('/api/' + this.get('config').version + '/devices', this.get('DeviceRouter'));
		router.use('/api/' + this.get('config').version + '/log', this.get('LogRouter'));
		router.use('/api/' + this.get('config').version + '/passes', this.get('PassRouter'));
		router.use('/api/' + this.get('config').version + '/admin', this.get('AdminRouter'));
	*/

	app.use('/', router);
	return router;

};
