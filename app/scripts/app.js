'use strict';

var jpsPassbookManagerApp = angular.module('jpsPassbookManagerApp', [
	'ngRoute',
	'ngResource',
	'mgcrea.ngStrap'
])

.controller('AppCtrl', function($scope, $rootScope, Api, $http, $routeParams, $location) {
	$rootScope.location = $location;
	$rootScope.passTypes = [{
		name: 'generic',
		title: 'Generic'
	}, {
		name: 'boardingPass',
		title: 'Boarding Pass'
	}, {
		name: 'coupon',
		title: 'Coupon'
	}, {
		name: 'eventTicket',
		title: 'Event Ticket'
	}, {
		name: 'storeCard',
		title: 'Store Card'
	}];

	window.App = $rootScope.App = {
		http: $http,
		api: Api,
		title: 'Pass Manager',
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
		],
		alerts: [],
		alert: function(type, msg) {
			$scope.$apply(function() {
				$rootScope.App.alert = {
					type: type,
					body: msg
				};
			});
		}
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
			resolve: {
				passes: function(Api) {
					return Api.request({
						method: 'GET',
						url: '/api/v1/admin/find?docType=pass'
					}).then(function(resp) {
						return resp.data;
					});
				}
			}
		})
		.when('/passes/:id', {
			templateUrl: './views/pass_details.html',
			controller: 'DetailCtrl',
			resolve: {
				pass: function($route, Api) {
					if ($route.current.params) {
						return Api.get($route.current.params.id).then(function(resp) {
							return resp.data;
						});
					}
				}
			}
		})

	.when('/docs', {
			templateUrl: './views/docs.html',
			controller: 'DocsCtrl',
			resolve: routeResolver
		})
		.when('/server', {
			templateUrl: './views/server.html',
			controller: 'ServerCtrl',
			resolve: {

				logs: function(Api) {
					return Api.request({
						method: 'GET',
						url: '/api/v1/admin/find?docType=log'
					}).then(function(resp) {
						return resp.data;
					});
				},
				devices: function(Api) {
					return Api.request({
						method: 'GET',
						url: '/api/v1/admin/find?docType=device'
					}).then(function(resp) {
						return resp.data;
					});
				},
				registrations: function(Api) {
					return Api.request({
						method: 'GET',
						url: '/api/v1/admin/find?docType=registration'
					}).then(function(resp) {
						return resp.data;
					}, function(){
						return []
					});
				}
			}
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
