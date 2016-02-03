'use strict';
const path = require('path');
const _ = require('lodash');
const pkg = require(path.resolve(__dirname, '../package.json'));
const defaultConfig = require(path.resolve(__dirname, '../config.js'));
const express = require('express');
const serveStatic = require('serve-static');

const Db = require('./db')();
const Models = require('./models');
const DIContainer = require('./di-container');
const utils = require('./utils')();
const jpsPassbook = require('./jps-passbook');
const SignPass = require('./signpass');

// const db = require('./adapters/db-couchdb')();
// const db = require('./adapters/db-redis')();
class Program extends DIContainer{

	constructor(config){
		super('Program');

		this.models = Models;
		this.pkg = pkg;
		this.log = utils.getLogger('program');
		this.getLogger = utils.getLogger;
		this.utils = utils;
		this.config = {
			defaults: _.assign(defaultConfig, config)
		};

		this.db = new Db(this.config.defaults.dataPath);
		this.app = express();
		this.port = process.env.PORT || this.config.defaults.server.port || 8181;
		this.host = process.env.VCAP_APP_HOST || process.env.IP || this.config.defaults.server.hostname || '127.0.0.1';

		// Instances
		this.register('config', this.config.defaults);
		this.register('db', this.db);
		this.register('app', this.app);
		this.register('utils', utils);

		// 3rd party
		this.register('path', path);
		this.register('_', _);
		this.register('assert', require('assert'));
		this.register('async', require('async'));

		this.factory('DB', Db);
		this.factory('Router', express.Router);
		this.factory('jpsPassbook', jpsPassbook);
		this.factory('SignPass', SignPass);

		// Routes
		this.factory('AdminRouter', require(path.resolve(__dirname, '../routes/jps-middleware-admin')));
	//	this.factory('AuthRouter', require(path.resolve(__dirname, '../routes/jps-middleware-auth')));
	//	this.factory('DbRouter', require(path.resolve(__dirname, '../routes/jps-middleware-db')));
//		this.factory('DevicesRouter', require(path.resolve(__dirname, '../routes/jps-middleware-devices')));
//		this.factory('PassesRouter', require(path.resolve(__dirname, '../routes/jps-middleware-passes')));
	//	this.factory('AppRouter', require(path.resolve(__dirname, '../routes/jps-passbook-routes')));

		// Models
		this.model('Device', require('./models/device'));
		this.model('Pass', require('./models/pass'));
		this.model('Passes', require('./models/passes'));
		this.model('Registration', require('./models/registration'));
		this.model('User', require('./models/user'));
		this.model('Users', require('./models/users'));

		this.register('BaseController', require('./controllers/base-controller'));
		this.controller('AdminController', require('./controllers/admin-controller'));
		this.controller('AppController', require('./controllers/app-controller'));
	//	this.controller('AuthController', require('./controllers/auth-controller'));
		//this.controller('DbController', require('./controllers/db-controller'));
		this.controller('DevicesController', require('./controllers/devices-controller'));
		this.controller('PassesController', require('./controllers/passes-controller'));

		this.initialize();
	}

	initialize(){
		this.app.use('/public', serveStatic(path.resolve(__dirname, './public')));
		this.app.use('/public', serveStatic(path.resolve(__dirname, './app/bower_components')));
		this.app.use('/public', serveStatic(path.resolve(__dirname, this.config.defaults.publicDir)));
		this.app.use('/', serveStatic(path.resolve(__dirname, this.config.defaults.staticDir)));

		this.app.set('views', path.resolve(__dirname, '../views'));
		this.app.set('view engine', 'ejs');
		this.app.engine('html', require('ejs').renderFile);
		this.app.use(require('connect-flash')());

	}

	mount(middleware){
		let _middleware = [
			path.resolve(__dirname, '../routes/jps-middleware-auth'),
			path.resolve(__dirname, '../routes/jps-middleware-admin'),
			path.resolve(__dirname, '../routes/jps-middleware-db'),
			path.resolve(__dirname, '../routes/jps-middleware-devices'),
			path.resolve(__dirname, '../routes/jps-middleware-passes')
		];
		_middleware.forEach(function(m) {
		//	require(m)(self, self.app);
		});

		//this.get('app').use( '/api/' + self.config.defaults.version + '/admin', self.get('AdminRouter'));
		return this.app;
	}

	require(name){
		return require(path.resolve(__dirname, name));
	}
}

module.exports = Program;
