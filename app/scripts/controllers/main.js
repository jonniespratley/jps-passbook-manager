'use strict';

jpsPassbookManagerApp.controller('MainCtrl', function($scope, $rootScope, $http) {

	$rootScope.App = {
		name: 'Passbook Manager',
		menu: [
			{ id: null, slug: 'home', title: 'Home', icon: 'home', href:'#/home' },
			{ id: null, slug: 'manage', title: 'Manage', icon: 'edit', href:'#/manage' },
			{ id: null, slug: 'server', title: 'Server', icon: 'cloud', href:'#/server' },
			{ id: null, slug: 'passes', title: 'Passes', icon: 'list', href:'#/passes' },
			{ id: null, slug: 'docs', title: 'Docs', icon: 'book', href:'#/docs' }
		]
	};



});
