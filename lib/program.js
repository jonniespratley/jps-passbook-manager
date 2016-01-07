'use strict';

module.exports = function(config) {
	const debug = require('debug');
	const http = require('http');
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
		db: new db.FileDataStore('data'),
		server: null,
		config: {
			defaults: config || {}
		}
	};
	return program;
};
