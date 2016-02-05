'use strict';
const express = require('express');
const path = require('path');
const pkg = require(path.resolve(__dirname, '../package.json'));
const _ = require('lodash');
const defaultConfig = require(path.resolve(__dirname, '../config.js'));

const Db = require('./db')();

const DIContainer = require('./di-container');
const jpsPassbook = require('./jps-passbook');
const SignPass = require('./signpass');

// const db = require('./adapters/db-couchdb')();
// const db = require('./adapters/db-redis')();
class Program extends DIContainer {

	constructor(config) {
		super('Program');
		this.initialize(config);
	}

	initialize(options) {

		this.config = {
			defaults: _.assign(defaultConfig, options)
		};
		this.session = {};
		this.pkg = pkg;
		this.db = new Db(this.config.defaults.dataPath);
		this.app = express();

		// Instances
		this.register('program', this);
		this.register('config', this.config.defaults);
		this.register('pkg', this.pkg);
		this.register('db', this.db);
		this.register('API_BASE', `/api/${this.get('config').version}`);
		this.register('app', this.app);
		this.register('session', this.session);
		this.register('models', require('./models'));

		//Modules
		this.register('DIContainer', DIContainer);

		this.factory('DB', Db);
		this.factory('jpsPassbook', jpsPassbook);
		this.factory('SignPass', SignPass);
		this.factory('Utils', require('./utils'));
		this.factory('Logger', require('./logger'));
		this.register('Server', require('./server'));


		// 3rd party
		this.register('glob', require('glob'));
		this.register('path', require('path'));
		this.register('_', require('lodash'));
		this.register('assert', require('assert'));
		this.register('async', require('async'));
		this.register('fs', require('fs-extra'));
		this.register('request', require('request'));
		//this.register('Router', express.Router);

		//Adapters
		this.factory('CouchDBAdapter', require(path.resolve(__dirname, './adapters/db-couchdb')));
		this.factory('RedisAdapter', require(path.resolve(__dirname, './adapters/db-couchdb')));


		// Models
		this.model('Device', require('./models/device'));
		this.model('Pass', require('./models/pass'));
		this.model('Passes', require('./models/passes'));
		this.model('Registration', require('./models/registration'));
		this.model('User', require('./models/user'));
		this.model('Users', require('./models/users'));

		//Controllers
		this.register('BaseController', require('./controllers/base-controller'));
		this.controller('AdminController', require('./controllers/admin-controller'));
		this.controller('AppController', require('./controllers/app-controller'));
		this.controller('AuthController', require('./controllers/auth-controller'));
		this.controller('DbController', require('./controllers/db-controller'));
		this.controller('DevicesController', require('./controllers/devices-controller'));
		this.controller('PassesController', require('./controllers/passes-controller'));

		//Routes
		//this.register('Routes', path.resolve(__dirname, '../routes/index'));
		this.factory('AuthService', path.resolve(__dirname, './services/auth-service'));
		this.factory('AppRouter', path.resolve(__dirname, './routes/index'));
		this.factory('AdminRouter', path.resolve(__dirname, './routes/admin'));
		this.factory('AuthRouter', path.resolve(__dirname, './routes/auth'));
		this.factory('DeviceRouter', path.resolve(__dirname, './routes/devices'));
		this.factory('LogRouter', path.resolve(__dirname, './routes/logs'));
		this.factory('PassRouter', path.resolve(__dirname, './routes/passes'));

		this.log = this.get('Logger').getLogger('program');
		this.getLogger = this.get('Logger').getLogger;
	}

	mount(routes) {
		let self = this;
		const Server = this.get('Server');
		let server = new Server(this);
		this.register('server', server);

		routes = routes || [];

		//Mount rotues
		server.app.use('/api/' + this.get('config').version, this.get('AppRouter'));
		server.app.use('/api/' + this.get('config').version, this.get('AuthRouter'));
		server.app.use('/api/' + this.get('config').version + '/devices', this.get('DeviceRouter'));
		server.app.use('/api/' + this.get('config').version + '/log', this.get('LogRouter'));
		server.app.use('/api/' + this.get('config').version + '/passes', this.get('PassRouter'));
		server.app.use('/api/' + this.get('config').version + '/admin', this.get('AdminRouter'));

		//const Routes = this.get('Routes');
		//let router = new Routes();
		return server.mount(routes);
	}

}

module.exports = Program;
