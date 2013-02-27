'use strict';

var jpsPassbookManagerApp = angular.module('jpsPassbookManagerApp', [ 'ngResource', 'ui', '$strap.directives',
])
  .config(['$routeProvider', function($routeProvider) {
	var routeResolver = {
		delay : function($q, $timeout) {
			var delay = $q.defer();
			$timeout(delay.resolve, 500);
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
        controller: 'ManageCtrl'
      })
      .when('/passes', {
        templateUrl: 'views/passes.html',
        controller: 'PassesCtrl'
      })
      .when('/docs', {
        templateUrl: 'views/docs.html',
        controller: 'DocsCtrl'
      })
      .when('/server', {
        templateUrl: 'views/server.html',
        controller: 'ServerCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
