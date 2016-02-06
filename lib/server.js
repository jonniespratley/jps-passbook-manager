'use strict';

const path = require('path');
const express = require('express');
const serveStatic = require('serve-static');
const flash = require('connect-flash');
const ejs = require('ejs');

class Server {

	constructor(program) {
		this.config = program.get('config');


		this.app = express();
		this.app.set('views', path.resolve(__dirname, '../views'));
		this.app.set('view engine', 'ejs');
		this.app.engine('html', ejs.renderFile);


		this.app.set('program', program);

		return this;
	}

	mount(routes) {
		let self = this;
		let app = this.app;
		let _routes = {};
		routes = routes || [];

		console.log('confiog', this.config);

		routes.forEach(function(m) {
			//_routes[path.basename(m)] = m;
			console.log('program.mount', m);
			self.use(
				require(m)(self)
			);
		});

		app.use('/public', serveStatic(path.resolve(__dirname, '../public')));
		app.use('/public', serveStatic(path.resolve(__dirname, '../app/bower_components')));
		app.use('/public', serveStatic(path.resolve(__dirname, this.config.publicDir)));
		app.use('/', serveStatic(path.resolve(__dirname, this.config.staticDir)));
		app.use(flash());

		// Instantiate the Express.js app
		app.use(function(req, res, next) {
			console.log('%s %s — %s', (new Date).toString(), req.method, req.url);
			return next();
		});
		// Implement server routes

		return this.app;
	}

	use(route, file) {
		console.log('program.use', route, file);
		return this.app.use.apply(route, file);
	}

}

module.exports = Server;
