'use strict';
angular.module('jpsPassbookManagerApp').factory('Api', function($http) {
	return function() {
		var request = function(o) {
			console.log('INFO', 'request', o);
			return $http(o);
		};

		return {
			allDocs: function(params) {
				return request({
					method: 'GET',
					params: params,
					url: '/api/v1/passes'
				});
			},
			get: function(id) {
				return request({
					method: 'GET',
					url: '/api/v1/passes/' + id
				});
			},
			put: function(obj) {
				return request({
					method: 'PUT',
					data: obj,
					url: '/api/v1/passes/' + obj._id
				});
			},
			remove: function(id) {
				return request({
					method: 'DELETE',
					url: '/api/v1/passes/' + id
				});
			},
			post: function(obj) {
				return request({
					method: 'POST',
					data: obj,
					url: '/api/v1/passes'
				});
			}
		};
	};
});
