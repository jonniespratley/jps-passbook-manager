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

var instantiated = null;
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

		this.register('namespace', 'sandbox');
		this.register('dbName', 'db');

		// Instances
		this.register('config', this.config.defaults);
		this.register('program', this);
		this.register('app', this.app);

		this.register('pkg', this.pkg);
		this.register('db', this.db);
		this.register('API_BASE', `/api/${this.get('config').version}`);

		this.register('session', this.session);
		this.register('models', require('./models'));

		//Modules
		this.register('DIContainer', DIContainer);

		this.plugin('DB', Db);
		this.plugin('jpsPassbook', jpsPassbook);
		this.plugin('SignPass', SignPass);
		this.plugin('Utils', require('./utils'));
		this.plugin('utils', require('./utils'));
		this.plugin('Logger', require('./logger'));
		this.plugin('Server', require('./server'));


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
		this.register('router', path.resolve(__dirname, '../routes/index'));

		this.log = this.get('Logger').getLogger('program');
		this.getLogger = this.get('Logger').getLogger;
	}

	mount(routes) {
		let self = this;

		const Server = require('./server');

		let server = new Server(self).mount(routes);
		this.register('server', server);

		return server;
	}

	run(cb) {
		console.log('Program.run');
		if (cb) {
			cb(this);
		}
	}

	use(plugin) {
		console.log('Program.use');
		this.inject(plugin);
		return this;
	}

}

Program.getInstance = function(conf) {
	if (!instantiated) {
		instantiated = new Program(conf);
	}
	return instantiated;
};
module.exports = Program;
