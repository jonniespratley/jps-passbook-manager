'use strict';
const path = require('path');
const pkg = require(path.resolve(__dirname, '../package.json'));
const debug = require('debug');

var utils = {};

utils.getLogger = function (name) {
	return debug(pkg.name + ':' + name);
};
module.exports = utils;
