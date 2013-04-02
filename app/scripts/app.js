'use strict';

var jpsPassbookManagerApp = angular.module('jpsPassbookManagerApp', [ 'ngResource', 'ui', '$strap.directives',
])
  .config(['$routeProvider', function($routeProvider) {
	var routeResolver = {
		delay : function($q, $timeout) {
			var delay = $q.defer();
			$timeout(delay.resolve, 700);
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

angular.element(document).ready(function () {
	$(".scroll").click(function (event) {
		event.preventDefault();
		$('html,body').animate({
			scrollTop : $(this.hash).offset().top - 50
		}, 'slow');
	});
	
	angular.element(document).find('.delete-btn').on('click', function (e) {
		e.preventDefault();
		var c = confirm('DELETE: Are you sure?');
		if (c) {
			return true;
		} else {
			//
		}
		console.log(e);
	});
	//Toggle content
	$('.page-header h1').live("click", function () {
		$(this).next().slideToggle(200);
	});
	$('.sec-header h3').live("click", function () {
		$(this).next().slideToggle(200);
	});
	$('legend').live("click", function () {
		$(this).next('div').slideToggle(200);
	});
});
