'use strict';

jpsPassbookManagerApp.controller('MainCtrl', function ($scope, $rootScope, $http, $routeParams, $location) {
	$rootScope.location = $location;
	$rootScope.App = {
		name: 'Pass Manager',
		icon: 'edit',
		hero: {
			title: 'Easy Passes',
			body: 'With this interface you can easily create Apple iOS Passbook Passes.'
		},
		menu: [
			{id: null, slug: 'home', title: 'Home', icon: 'home', href: '#/home'},
			//	{ id: null, slug: 'manage', title: 'Manage', icon: 'edit', href:'#/manage' },
			{id: null, slug: 'passes', title: 'Passes', icon: 'tags', href: '#/passes'},
			{id: null, slug: 'server', title: 'Server', icon: 'cloud', href: '#/server'},
			{id: null, slug: 'docs', title: 'Docs', icon: 'book', href: '#/docs'}
		]
	};
	$http.get('/README.md').success(function (data) {
		angular.element('#docs').html(markdown.toHTML(data));
	});


});
