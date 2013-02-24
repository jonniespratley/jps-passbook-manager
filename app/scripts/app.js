'use strict';

var jpsPassbookManagerApp = angular.module('jpsPassbookManagerApp', [])
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
      .otherwise({
        redirectTo: '/'
      });
  }]);
