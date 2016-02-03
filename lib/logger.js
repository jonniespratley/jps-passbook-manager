'use strict';
module.exports = function(path, pkg){
	const debug = require('debug');

	class Logger {
		constructor(name){

		}
		getLogger(name){
			return debug(pkg.name + ':' + name);
		}
	}
	return new Logger();
};
