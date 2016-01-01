module.exports = function (config) {
	var debug = require('debug');
	var db = require('./db')(config);
	var logger = debug('program');

	logger("Some debug messages");

	var program = {
		log: logger,
		config: {
			defaults: config
		},
		db: db
	};
	return program;
};
