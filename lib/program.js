'use strict';
const path = require('path');
const pkg = require(path.resolve(__dirname, '../package.json'));
const _ = require('lodash');

const defaultConfig = require(path.resolve(__dirname, '../config.js'));
const express = require('express');


const Db = require('./db')();

const Server = require('./server');
const Models = require('./models');

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
		this.models = Models;
		this.config = {
			defaults: _.assign(defaultConfig, options)
		};
		this.pkg = pkg;
		this.db = new Db(this.config.defaults.dataPath);
		this.app = express();

		// Instances
		this.register('config', this.config.defaults);
		this.register('pkg', this.pkg);
		this.register('db', this.db);
		this.register('app', this.app);
		this.register('models', Models);

		//Modules
		this.register('DIContainer', DIContainer);

		this.factory('DB', Db);

		this.factory('jpsPassbook', jpsPassbook);
		this.factory('SignPass', SignPass);
		this.factory('Utils', require('./utils'));
		this.factory('Logger', require('./logger'));
		this.factory('Server', require('./server'));

		// 3rd party
		this.register('glob', require('glob'));
		this.register('path', require('path'));
		this.register('_', require('lodash'));
		this.register('assert', require('assert'));
		this.register('async', require('async'));
		this.register('fs', require('fs-extra'));
		this.register('request', require('request'));
		this.register('Router', express.Router);

		//	this.factory('utils', require('./utils'));


		//Adapters
		this.factory('CouchDBAdapter', require(path.resolve(__dirname, './adapters/db-couchdb')));
		this.factory('RedisAdapter', require(path.resolve(__dirname, './adapters/db-couchdb')));

		// Routes
		this.factory('AdminRouter', require(path.resolve(__dirname, '../routes/jps-middleware-admin')));
		this.factory('AuthRouter', require(path.resolve(__dirname, '../routes/jps-middleware-auth')));
		this.factory('AppRouter', require(path.resolve(__dirname, '../routes/jps-passbook-routes')));
		this.factory('DbRouter', require(path.resolve(__dirname, '../routes/jps-middleware-db')));
		this.factory('DevicesRouter', require(path.resolve(__dirname, '../routes/jps-middleware-devices')));
		this.factory('PassesRouter', require(path.resolve(__dirname, '../routes/jps-middleware-passes')));

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


		this.log = this.get('Logger').getLogger('program');
		this.getLogger = this.get('Logger').getLogger;
	}

	mount(routes) {
		let server = new Server(this.get('config'));
		return server.mount(routes);
		//	return require(path.resolve(__dirname, name));
	}

	require(name) {
		return require(path.resolve(__dirname, name));
	}
}

module.exports = Program;
