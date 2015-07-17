'use strict';

var jpsPassbookManagerApp = angular.module('jpsPassbookManagerApp', [
	'ngRoute',
	'ngResource',
	'mgcrea.ngStrap'
])
	.config(['$routeProvider', function ($routeProvider) {
		var routeResolver = {
			delay: function ($q, $timeout) {
				var delay = $q.defer();
				$timeout(delay.resolve, 0);
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

	jpsPassbookManagerApp.config([
  '$provide', function($provide) {
    return $provide.decorator('$rootScope', [
      '$delegate', function($delegate) {
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
