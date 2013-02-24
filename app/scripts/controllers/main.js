'use strict';

jpsPassbookManagerApp.controller('MainCtrl', function($scope, $rootScope, $http) {

	$rootScope.App = {
		menu: [
			{ id: null, slug: 'home', title: 'Home', icon: 'home', href:'#/home' },
			{ id: null, slug: 'builder', title: 'Builder', icon: 'wand', href:'#/builder' },
			{ id: null, slug: 'wizard', title: 'Wizard', icon: 'list', href:'#/wizard' },
			{ id: null, slug: 'docs', title: 'Docs', icon: 'book', href:'#/docs' }
		]
	};

	$http.get('markdown/home.md').success(function(data){
		angular.element('#main').html(markdown.toHTML(data));
	});

});
