'use strict';

var jpsPassbookManagerApp = angular.module('jpsPassbookManagerApp', [
	'ngRoute',
	'ngResource',
	'mgcrea.ngStrap',
	'bootcards'
])
	.config(['$routeProvider', function ($routeProvider) {
		var routeResolver = {
			delay: function ($q, $timeout) {
				var delay = $q.defer();
				$timeout(delay.resolve, 300);
				return delay.promise;
			}
		};

		$routeProvider
			.when('/', {
				templateUrl: 'views/main.html',
				controller: 'MainCtrl',
				resolve: routeResolver
			})
			.when('/manage', {
				templateUrl: 'views/manage.html',
				controller: 'ManageCtrl',
				resolve: routeResolver
			})
			.when('/passes', {
				templateUrl: 'views/passes.html',
				controller: 'PassesCtrl',
				resolve: routeResolver
			})
			.when('/passes/add', {
				templateUrl: 'views/passes_add.html',
				controller: 'PassesCtrl',
				resolve: routeResolver
			})
			.when('/passes/edit/:id', {
				templateUrl: 'views/passes_add.html',
				controller: 'PassesCtrl',
				resolve: routeResolver
			})
			.when('/docs', {
				templateUrl: 'views/docs.html',
				controller: 'DocsCtrl',
				resolve: routeResolver
			})
			.when('/server', {
				templateUrl: 'views/server.html',
				controller: 'ServerCtrl',
				resolve: routeResolver
			})
			.otherwise({
				redirectTo: '/'
			});
	}]);
