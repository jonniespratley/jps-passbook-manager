module.exports = function (config) {
	var debug = require('debug');
	var db = require('./db');
	var logger = debug('jps:program');

	var program = {
		log: logger,
		getLogger: function (name) {
			return debug('jps:' + name);
		},
		config: {
			defaults: config
		},
		db: new db.FileDataStore('data')
	};
	return program;
};
