'use strict';

module.exports = function (config) {
	console.warn('auth-service', config);
	var authService = {};

	authService.login = function (username, password, callback) {
		//...same as in the previous version
	};

	authService.checkToken = function (token, callback) {
		//...same as in the previous version
	};

	return authService;
};
