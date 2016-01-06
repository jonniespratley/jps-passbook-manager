'use strict';

angular.module('jpsPassbookManagerApp').controller('PassesCtrl', function($scope, Api, $rootScope, $http, $document,
	$compile, $route, $routeParams, $location) {
	$scope.name = "SmartPassCtrl";
	$scope.$route = $route;
	$scope.$location = $location;
	$scope.$routeParams = $routeParams;
	$scope.cdn = 'http://1ff1217913c5a6afc4c8-79dc9bd5ca0b6e6cb6f16ffd7b1e05e2.r26.cf1.rackcdn.com';

	//var db = new PouchDB('/api/v1/db/passbookmanager');
	var db = new Api();

	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}

	function guid() {
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	}

	$scope.tabs = [{
		id: 'passes',
		title: 'Passes'
	}, {
		id: 'registrations',
		title: 'Registrations'
	}, {
		id: 'logs',
		title: 'Logs'
	}];

	$scope.selectTab = function(t) {
		$scope.tabs.forEach(function(tab) {
			tab.active = false;
		})
		t.active = !t.active;
	}

	$scope.SmartPass = {
		api: {
			url: location.protocol + '//' + location.hostname + ':' + location.port + '/api/v1'
		},
		types: [{
			name: 'generic',
			title: 'Generic'
		}, {
			name: 'boardingPass',
			title: 'Boarding Pass'
		}, {
			name: 'coupon',
			title: 'Coupon'
		}, {
			name: 'eventTicket',
			title: 'Event Ticket'
		}, {
			name: 'storeCard',
			title: 'Store Card'
		}],
		passes: [],
		pass: null,
		barcodes: [{
			name: 'QR Barcode',
			value: 'PKBarcodeFormatQR'
		}, {
			name: 'PDF Barcode',
			value: 'PKBarcodeFormatPDF417'
		}, {
			name: 'Aztec Barcode',
			value: 'PKBarcodeFormatAztec'
		}],
		init: function() {
			//  $('.datepicker').datepicker();
			//  $('.timepicker').timepicker();
			//  $('.colorpicker').colorpicker();
			this.getPasses();
		},
		loadSchema: function() {
			console.log($scope.pass.type);
			$http.get('/passes/schemas/' + $scope.pass.type + '.json').success(function(data) {
				$scope.pass = data;

				console.log('loadSchema', $scope.pass.type, data);
			});
		},
		selectPass: function(p) {
			$scope.SmartPass.pass = p;
			$scope.pass = p;
			console.log('selectPass', p);
		},
		clearPass: function() {
			$scope.SmartPass.pass = null;
			$scope.SmartPass.pass = angular.copy($scope.SmartPass.coupon);
			$scope.pass = null;
			console.log('clearPass', this);
		},

		deletePass: function(p) {
			$scope.SmartPass.pass = p;
			$scope.pass = p;
			console.log('deletePass', p);
			db.remove(p._id).then(function(data) {
				angular.element(p._id).remove();
				$scope.SmartPass.getPasses();
				console.log('deletePass', data);
			}).catch(function(err) {
				console.error(err);
			});
		},
		getPasses: function() {
			var options = {
				include_docs: true
			};
			db.allDocs(options).then(function(resp) {
				console.log('getPasses', resp);
				if (resp && resp.data) {
					$rootScope.safeApply(function() {
						$scope.SmartPass.passes = resp.data.rows || resp.data;
					});
				}
			});
		},
		savePass: function(p) {
			p = p || {};
			console.log('savePass', p);
			if (p._id) {
				db.put(p).then(function(data) {
					console.log('response', data);
					if (data) {
						$scope.SmartPass.pass = null;
						$scope.SmartPass.getPasses();
						$scope.SmartPass.clearPass();
					}
				}).catch(function(err) {
					console.error('savePass', err);
				});
			} else {
				db.post(p).then(function(data) {
					if (data) {
						$scope.SmartPass.pass = data;
						$scope.SmartPass.getPasses();
					}
					console.log('createPass', data);
				});
			}
		},
		packagePass: function(p) {
			console.log('packagePass', p);
		},
		exportPass: function(p) {
			console.log('exportPass', p);
			$scope.SmartPass.pass = p;
			$http.get('/api/v1/export/' + p._id + '').success(function(data) {
				console.log('export result', data);
				$scope.SmartPass.signPass(p, data.filename);
			});
		},
		signPass: function(p, path) {
			var signUrl = '/api/v1/sign/' + p._id + '?path=' + path;
			$scope.SmartPass.pass.url = signUrl;
			window.open(signUrl);
			console.log('signPass', path);
		},
		updatedQrcode: function(p) {
			angular.element('#pass-qrcode')
				.empty()
				.qrcode(p.barcode.message);
		},
		add: function() {
			this.pass = $scope.SmartPass.storeCard;
		}
	};



	$scope.SmartPass.coupon = {
		"mode": "edit",
		"formatVersion": 1,
		"passTypeIdentifier": "pass.passbookmanager.io",
		"serialNumber": "E5982H-I2",
		"teamIdentifier": "USE9YUYDFH",
		"webServiceURL": 'http://' + location.hostname + ':' + location.port + '/smartpass/v1',
		"authenticationToken": "000000000012341234",
		"barcode": {
			"message": "123456789",
			"format": "PKBarcodeFormatQR",
			"messageEncoding": "iso-8859-1"
		},
		"locations": [{
			"longitude": -122.3748889,
			"latitude": 37.6189722
		}],
		"organizationName": " Coupon",
		"logoText": "Logo",
		"description": "20% off any products",
		"foregroundColor": "#111",
		"backgroundColor": "#222",
		"coupon": {
			"primaryFields": [{
				"key": "offer",
				"label": "Any premium dog food",
				"value": "20% off"
			}],
			"auxiliaryFields": [{
				"key": "starts",
				"label": "STARTS",
				"value": "Feb 5, 2013"
			}, {
				"key": "expires",
				"label": "EXPIRES",
				"value": "March 5, 2012"
			}],
			"backFields": [{
				"key": "terms",
				"label": "TERMS AND CONDITIONS",
				"value": "Generico offers this pass, including all information, software, products and services available from this pass or offered as part of or in conjunction with this pass (the \"pass\"), to you, the user, conditioned upon your acceptance of all of the terms, conditions, policies and notices stated here. Generico reserves the right to make changes to these Terms and Conditions immediately by posting the changed Terms and Conditions in this location.\n\nUse the pass at your own risk. This pass is provided to you \"as is,\" without warranty of any kind either express or implied. Neither Generico nor its employees, agents, third-party information providers, merchants, licensors or the like warrant that the pass or its operation will be accurate, reliable, uninterrupted or error-free. No agent or representative has the authority to create any warranty regarding the pass on behalf of Generico. Generico reserves the right to change or discontinue at any time any aspect or feature of the pass."
			}]
		}
	};

	$scope.pass = angular.copy($scope.SmartPass.coupon);
	$scope.order = 'lastUpdated';
	$scope.reverse = false;
	$scope.pass.type = 'coupon';

	$scope.toggle = function(event) {
		console.log(event);
		$(event.target).next().slideToggle();
	};

	console.warn('passes ctrl', $scope);
});
