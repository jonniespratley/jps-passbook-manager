'use strict';

jpsPassbookManagerApp.controller('ServerCtrl', function ($scope, $rootScope, api, $http) {
	$scope.awesomeThings = [
		'HTML5 Boilerplate',
		'AngularJS',
		'Testacular'
	];


	/* ======================[ @TODO:
	 I hold methods for checking the api and testing if its alive

	 calls I can make are

	 //API Endpoint
	 http://localhost:4040/api - passbookmanager

	 //Datasource
	 http://localhost:4040/api/v1 -> passbookmanager

	 //All collections
	 http://localhost:4040/api/v1/passbookmanager -> List of tables

	 //All passes
	 http://localhost:4040/api/v1/passbookmanager/passes

	 //All devices
	 http://localhost:4040/api/v1/passbookmanager/devices

	 //All notifications
	 http://localhost:4040/api/v1/passbookmanager/notifications


	 ]====================== */
	$scope.logs = [];
	$scope.selectedLog = null;
	$scope.selectLog = function(o){
		$scope.selectedLog = o;
		console.log(o);
	};

	$scope.Server = {
		init: function(){
			$http.get('/api/v1/log').success(function(data){
				$scope.logs = data;
				console.log(data);
			});
		}
	};


});
