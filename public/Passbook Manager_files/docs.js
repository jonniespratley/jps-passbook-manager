'use strict';

jpsPassbookManagerApp.controller('DocsCtrl', function ($scope, $rootScope, $http) {
	$http.get('/README.md').success(function (data) {
		angular.element('#docs').html(markdown.toHTML(data));
	});
});
