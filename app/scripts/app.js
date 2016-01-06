'use strict';

var jpsPassbookManagerApp = angular.module('jpsPassbookManagerApp', [
		'ngRoute',
		'ngResource',
		'mgcrea.ngStrap'
	])
	.controller('AppCtrl', function($rootScope) {

	})
	.controller('AppCtrl', function($scope, $rootScope, $http, $routeParams, $location) {
		$rootScope.location = $location;
		$rootScope.App = {
			title: 'jps-passbook-manager',
			description: 'With this interface you can easily manage Apple Wallet Passes.',
			icon: 'edit',
			hero: {
				title: 'Easy Passes',
				body: 'With this interface you can easily create Apple iOS Passbook Passes.'
			},
			menu: [{
					id: null,
					slug: 'home',
					title: 'Home',
					icon: 'home',
					href: '#/home'
				},
				//	{ id: null, slug: 'manage', title: 'Manage', icon: 'edit', href:'#/manage' },
				{
					id: null,
					slug: 'passes',
					title: 'Passes',
					icon: 'tags',
					href: '#/passes'
				}, {
					id: null,
					slug: 'server',
					title: 'Server',
					icon: 'cloud',
					href: '#/server'
				}, {
					id: null,
					slug: 'docs',
					title: 'Docs',
					icon: 'book',
					href: '#/docs'
				}
			]
		};
		$http.get('/README.md').success(function(data) {
			angular.element('#docs').html(markdown.toHTML(data));
		});

	})

.config(['$routeProvider', function($routeProvider) {
	var routeResolver = {
		delay: function($q, $timeout) {
			var delay = $q.defer();
			$timeout(delay.resolve, 0);
			return delay.promise;
		}
	};

	$routeProvider
		.when('/', {
			templateUrl: './views/main.html',
			controller: 'MainCtrl',
			resolve: routeResolver
		})
		.when('/admin', {
			templateUrl: './views/manage.html',
			controller: 'ManageCtrl',
			resolve: routeResolver
		})
		.when('/passes', {
			templateUrl: './views/passes.html',
			controller: 'PassesCtrl',
			resolve: routeResolver
		})
		.when('/passes/add', {
			templateUrl: './views/passes_add.html',
			controller: 'PassesCtrl',
			resolve: routeResolver
		})
		.when('/passes/edit/:id', {
			templateUrl: './views/passes_add.html',
			controller: 'PassesCtrl',
			resolve: routeResolver
		})
		.when('/docs', {
			templateUrl: './views/docs.html',
			controller: 'DocsCtrl',
			resolve: routeResolver
		})
		.when('/server', {
			templateUrl: './views/server.html',
			controller: 'ServerCtrl',
			resolve: routeResolver
		})
		.otherwise({
			redirectTo: '/'
		});
}]);

jpsPassbookManagerApp.config([
	'$provide',
	function($provide) {
		return $provide.decorator('$rootScope', [
			'$delegate',
			function($delegate) {
				$delegate.safeApply = function(fn) {
					var phase = $delegate.$$phase;
					if (phase === "$apply" || phase === "$digest") {
						if (fn && typeof fn === 'function') {
							fn();
						}
					} else {
						$delegate.$apply(fn);
					}
				};
				return $delegate;
			}
		]);
	}
]);
