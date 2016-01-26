'use strict';

module.exports = function(config) {
	const debug = require('debug');
	const _ = require('lodash');
	const http = require('http');
	const path = require('path');
	const pkg = require(path.resolve(__dirname, '../package.json'));

	const defaultConfig = require(path.resolve(__dirname, '../config.js'));
	const DB = require('./db');
	//const db = require('./adapters/db-couchdb')();
	//const db = require('./adapters/db-redis')();
	const utils = require('./utils');

	var logger = utils.getLogger('program');
	if (!config) {
		config = defaultConfig;
	}

	config = _.assign(defaultConfig, config);
	var db = new DB.FileDataStore(config.dataPath);
	var program = {
		pkg: pkg,
		log: logger,
		getLogger: utils.getLogger,
		utils: utils,
		models: require('./models'),
		modules: {
			db: db,
			Pusher: require('./pusher'),
			Passbook: require('./jps-passbook'),
			SignPass: require('./signpass')
		},
		db: db,
		server: null,
		config: {
			defaults: config
		},
		require: function(name) {
			return require(path.resolve(__dirname, name));
		}
	};


	// TODO: Save Config
	//config


	return program;
};
