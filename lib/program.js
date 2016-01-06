'use strict';

module.exports = function(config) {
	const debug = require('debug');

	const path = require('path');
	const utils = require('./utils');
	const db = require('./db');

	const pkg = require(path.resolve(__dirname, '../package.json'));
	var logger = utils.getLogger('program');

	if(!config){
		config = require(path.resolve(__dirname, '../config.js'));
		logger('default Config', config);
	}

	var program = {
		log: logger,
		getLogger: utils.getLogger,
		config: {
			defaults: config || {}
		},
		db: new db.FileDataStore('data')
	};
	return program;
};
