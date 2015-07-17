'use strict';

jpsPassbookManagerApp.controller('ServerCtrl', function ($scope) {
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



	$scope.Server = {};
	var socket = io();
		socket.on('newlog', function(logs){
			console.log("logging", logs);
			var $console = $("#console");
			var $page = $('html, body');
			var $document = $(document);
			var len = logs.length;
			var log = '';
			for (var i = 0; i < len; i++) {
				log = ansi_up.ansi_to_html(logs[i].msg);
				$console.append(log);
				console.log('log', log);
			}

			$page.stop(true, true).animate({ scrollTop: $document.height() }, "slow");
		});
		]====================== */
});
