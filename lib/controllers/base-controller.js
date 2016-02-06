'use strict';

const Logger = require('../logger')();
class BaseController {

	constructor(name, options) {
		this.name = name;
		this.options = options;
		this.logger = Logger.getLogger(name);
	}

	init() {
		this.logger('init');
	}

	start() {
		this.logger('start');
	}

	destroy() {
		this.logger('destroy');
	}
}

module.exports = BaseController;
