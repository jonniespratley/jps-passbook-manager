'use strict';

module.exports = function(config) {
	const debug = require('debug');
	const _ = require('lodash');
	const http = require('http');
	const path = require('path');
	const utils = require('./utils');
	const db = require('./db');
	const pkg = require(path.resolve(__dirname, '../package.json'));

	var defaultConfig = require(path.resolve(__dirname, '../config.js'));

	var logger = utils.getLogger('program');
	logger('default Config', defaultConfig);

	if (!config) {
		config = defaultConfig;
		logger('passes Config', config);
	}

	config = _.assign(defaultConfig, config);

	var program = {
		log: logger,
		getLogger: utils.getLogger,
		db: new db.FileDataStore(config.dataPath || 'data'),
		server: null,
		config: {
			defaults: config
		},
		require: function(name) {
			return require(path.resolve(__dirname, name));
		}
	};
	return program;
};
