'use strict';

module.exports = function (config) {
	const debug = require('debug');
	const _ = require('lodash');
	const http = require('http');
	const DB = require('./db');
	const path = require('path');
	const utils = require('./utils');

	////const db = require('./adapters/db-couchdb')();
//	const db = require('./adapters/db-redis')();
	const pkg = require(path.resolve(__dirname, '../package.json'));

	var defaultConfig = require(path.resolve(__dirname, '../config.js'));

	var logger = utils.getLogger('program');
	logger('default Config', defaultConfig);

	if (!config) {
		config = defaultConfig;
		logger('passes Config', config);
	}

	config = _.assign(defaultConfig, config);
	var db = new DB.FileDataStore(config.dataPath || 'data');
	var program = {
		log: logger,
		getLogger: utils.getLogger,
		db: db,
		server: null,
		config: {
			defaults: config
		},
		require: function (name) {
			return require(path.resolve(__dirname, name));
		}
	};
	return program;
};
