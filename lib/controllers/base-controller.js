'use strict';
const utils = require('../utils')();

class BaseController {

	constructor(name, options) {
		this.name = name;
		this.options = options;
		this.logger = utils.getLogger(name);
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
