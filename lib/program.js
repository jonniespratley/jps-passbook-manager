module.exports = function (config) {
	var debug = require('debug');
	var db = require('./db');
	var logger = debug('program');

	var program = {
		log: logger,
		getLogger: function (name) {
			return debug('jps-passbook:' + name);
		},
		config: {
			defaults: config
		},
		db: new db.FileDataStore('db')
	};
	return program;
};
