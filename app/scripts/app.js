'use strict';

var jpsPassbookManagerApp = angular.module('jpsPassbookManagerApp', [
	'ngRoute',
	'ngAnimate',
	'ngResource',
	'ui.ace',
	'mgcrea.ngStrap'
])

.controller('AppCtrl', function($scope, $rootScope, Api, $http, $routeParams, $location) {
	$rootScope.location = $location;

	var db = Api;
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
		debug: true,
		db: db,
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
		},
		hideModals: function() {
			$('.modal').modal('hide');
			$('.modal-backdrop').remove();
		},
		savePass: function(p) {
			var self = this;
			p = p || {};
			console.log('savePass', p);


			if (p._id) {
				db.put(p).then(function(resp) {
					console.log('response', resp);
					$scope.pass = resp.data;
					self.hideModals();
					$location.path('/passes')
				}).catch(function(err) {
					console.error('savePass', err);
				});
			} else {
				db.post(p).then(function(resp) {
					console.log('createPass', resp);
					self.hideModals();
					$location.path('/passes/' + resp.data._id);
				}).catch(function(err) {
					console.error('db.post', err);
					alert('Error while creating pass');
				});
			}
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
		.when('/manage', {
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
					}, function() {
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
