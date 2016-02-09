'use strict';
const path = require('path');
const express = require('express');
const serveStatic = require('serve-static');
const flash = require('connect-flash');
const ejs = require('ejs');

let app = null;
let config;

class Server {
	constructor(program) {
		config = program.get('config');

		app = express();


		app.set('views', path.resolve(__dirname, '../views'));
		app.set('view engine', 'ejs');

		app.engine('html', ejs.renderFile);
		app.set('program', program);
		app.use('/public', serveStatic(path.resolve(__dirname, '../public')));
		app.use('/public', serveStatic(path.resolve(__dirname, '../app/bower_components')));
		app.use('/public', serveStatic(path.resolve(__dirname, config.publicDir)));
		app.use('/', serveStatic(path.resolve(__dirname, config.staticDir)));
		app.use(flash());

		// Instantiate the Express.js app
		app.use(function(req, res, next) {
			console.log('%s %s — %s', new Date().toString(), req.method, req.url);
			return next();
		});
		// Implement server routes

		return this;
	}

	mount(routes) {
		let self = this;
		routes = routes || [];
		routes.forEach(function(m) {
			console.log('program.mount', m);
		});

		return this.app;
	}


	use(route, file) {
		console.log('program.use', route, file);
		return this.app.use.apply(route, file);
	}

}

module.exports = Server;
