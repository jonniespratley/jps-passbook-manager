'use strict';
const debug = require('debug');
const path = require('path');
const pkg = require(path.resolve(__dirname, '../package.json'));

module.exports = function() {
	class Logger {
		constructor(name) {}
		getLogger(category) {
			return debug(`${pkg.name}:${category}`);
		}
	}
	return new Logger();
};
