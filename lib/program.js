'use strict';

module.exports = function(config) {
	const debug = require('debug');
	const path = require('path');
	const db = require('./db');
	var logger = debug('jps:program');

	if(!config){
		config = require(path.resolve(__dirname, '../config.js'));
		logger('default Config', config);
	}


	var program = {
		log: logger,
		getLogger: function(name) {
			return debug('jps:' + name);
		},
		config: {
			defaults: config || {}
		},
		db: new db.FileDataStore('data')
	};
	return program;
};
