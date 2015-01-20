/**
 * Foo - This is the main controller that holds the sub-modules routes and etc
 * for docs.
 * @file /WWW/AppMatrixEngine/ame-angular/app/modules/controllers.js
 * @object
 */
var SmartPassModule = angular.module('SmartPassModule', ['ui']);
//Routes
SmartPassModule.config(['$routeProvider', '$locationProvider',
function($routeProvider, $locationProvider) {
	var routeResolver = {
		delay : function($q, $timeout) {
			var delay = $q.defer();
			$timeout(delay.resolve, 500);
			return delay.promise;
		}
	};
	//@TODO: Change to module urls
	$routeProvider.when('/', {
		templateUrl : 'views/index.html',
		controller : SmartPassCtrl,
		resolve : routeResolver
	});
	//@TODO: Change to module urls
	$routeProvider.when('/index', {
		templateUrl : 'views/index.html',
		controller : SmartPassCtrl,
		resolve : routeResolver
	});
	$routeProvider.when('/module', {
		templateUrl : 'views/module.html',
		controller : MainCtrl,
		resolve : routeResolver
	});
	$routeProvider.when('/widget', {
		templateUrl : 'views/widget.html',
		controller : WidgetCtrl,
		resolve : routeResolver
	});
	$routeProvider.when('/mobile', {
		templateUrl : 'views/mobile.html',
		controller : MobileCtrl,
		resolve : routeResolver
	});
	$routeProvider.when('/docs', {
		templateUrl : 'views/docs.html',
		controller : MobileCtrl,
		resolve : routeResolver
	});
	$locationProvider.html5Mode(false);
}]);
//Main module controller
function MainCtrl($scope, $rootScope, $route, $routeParams, $location) {
	$scope.name = "MainCtrl";
	$scope.$route = $route;
	$scope.$location = $location;
	$scope.routeParams = $routeParams;
	$scope.params = $routeParams;
	console.log($scope);
}
//Other modules controller
function ModuleCtrl($scope, $rootScope, $route, $routeParams, $location) {
	$scope.name = "ModuleCntl";
	$scope.$route = $route;
	$scope.$location = $location;
	$scope.$routeParams = $routeParams;
	$scope.$params = $routeParams;
	console.log($scope);
}
//Mobile module controller
function MobileCtrl($scope, $rootScope, $route, $routeParams, $location) {
	$scope.name = "MobileCtrl";
	$scope.$params = $routeParams;
	$scope.$route = $route;
	$scope.$location = $location;
	$scope.$routeParams = $routeParams;
	console.log($scope);
}
//Widget dashboard controller
function WidgetCtrl($scope, $rootScope, $route, $routeParams, $location) {
	$scope.name = "WidgetCtrl";
	$scope.$route = $route;
	$scope.$location = $location;
	$scope.$params = $routeParams;
	console.log($scope);
}
function SmartPassCtrl($scope, $rootScope, $http, $document, $compile, $route, $routeParams, $location) {
	$scope.name = "SmartPassCtrl";
	$scope.$route = $route;
	$scope.$location = $location;
	$scope.$routeParams = $routeParams;
	$scope.cdn = 'http://1ff1217913c5a6afc4c8-79dc9bd5ca0b6e6cb6f16ffd7b1e05e2.r26.cf1.rackcdn.com';
 
	$scope.classes = [{
		title : 'Builder',
		body : 'This is the desc',
		template : 'ame-studio/builder/index.html',
		slug : 'builder'
	}, {
		title : 'Wizard',
		body : 'This is the desc',
		template : 'ame-studio/wizard/index.html',
		slug : 'wizard'
	}, {
		title : 'Device',
		body : 'This is the desc',
		template : 'ame-studio/device/index.html',
		slug : 'device'
	}, {
		title : 'Simulator',
		body : 'This is the desc',
		template : 'ame-studio/templates/DeviceWiki.html',
		slug : 'simulator'
	}, {
		title : 'SmartApp',
		body : 'This is the desc',
		template : 'ame-studio/smartapp/index.html',
		slug : 'smartapp'
	}];
	$rootScope.SmartPass = {
		api : {
			url : 'http://localhost:3535/smartpass/v1'
		},
		types : [{
			name : 'generic',
			title : 'Generic'
		}, {
			name : 'boardingPass',
			title : 'Boarding Pass'
		}, {
			name : 'coupon',
			title : 'Coupon'
		}, {
			name : 'eventTicket',
			title : 'Event Ticket'
		}, {
			name : 'storeCard',
			title : 'Store Card'
		}],
		passes : [],
		pass : null,
		barcodes : [{
			name : 'QR Barcode',
			value : 'PKBarcodeFormatQR'
		}, {
			name : 'PDF Barcode',
			value : 'PKBarcodeFormatPDF417'
		}, {
			name : 'Aztec Barcode',
			value : 'PKBarcodeFormatAztec'
		}],
		loadSchema: function(){
			console.log($scope.pass.type);
			$http.get('passes/'+$scope.pass.type+'.json').success(function(data){
				$scope.pass = data;
				console.log('loadSchema', $scope.pass.type, data);
			});
		},
		selectPass : function(p) {
			$rootScope.SmartPass.pass = p;
			$scope.pass = p;
			console.log('selectPass', p);
		},
		clearPass : function() {
			$rootScope.SmartPass.pass = angular.copy($rootScope.SmartPass.coupon);
			$scope.pass = angular.copy($rootScope.SmartPass.coupon);
			console.log('clearPass', this);
		},
		deletePass : function(p) {
			//$rootScope.SmartPass.pass = p;
			$scope.pass = p;
			var c = confirm('Are you sure?');
			if (c) {
				$http.
				delete ('/api/v2/myappmatrix/passes/' + p._id).success(function(data) {
					angular.element('#pass-' + p._id).remove();
					console.log('deletePass', data);
				});
			};
			console.log('deletePass', p);
		},
		getPasses : function() {
			$http.get('/api/v2/myappmatrix/passes').success(function(data) {
				$rootScope.SmartPass.passes = data;
				console.log('getPasses', data);
			});
		},
		savePass : function(p) {
			p.updated = new Date();
			if (p._id) {
				$http.put('/api/v2/myappmatrix/passes/' + p._id, p).success(function(data) {
					console.log('savePass', data);
					if (data.ok) {
						$rootScope.SmartPass.pass = null;
						$rootScope.SmartPass.getPasses();
					}
				});
			} else {
				$http.post('/api/v2/myappmatrix/passes', p).success(function(data) {
					//$rootScope.SmartPass.pass = data;
					if (data.ok) {
						$rootScope.SmartPass.pass = null;
						$rootScope.SmartPass.getPasses();
					}
					console.log('createPass', data);
				});
			}
		},
		packagePass : function(p) {
			console.log('packagePass', p);
		},
		signPass : function(p) {
			console.log('signPass', p);
		}
	};
	
	
	$rootScope.SmartPass.storeCard = {
		"formatVersion" : 1,
		"passTypeIdentifier" : "pass.myappmatrix.coupons",
		"serialNumber" : "SMS001",
		"teamIdentifier" : "J62UV6D7WJ",
		"webServiceURL" : "https://www.myappmatrix.com/smartpasses/",
		"authenticationToken" : "vxwxd7J8AlNNFPS8k0a0FfUFtq0ewzFdc",
		"organizationName" : "Apple Retail: Arden Fair",
		"description" : "Apple Retail Store Credio",
		"logoText" : "Apple Retail",
		"foregroundColor" : "rgb(255, 255, 255)",
		"backgroundColor" : "rgb(171, 181, 191)",
		"storeCard" : {
			"primaryFields" : [{
				"key" : "blank1",
				"label" : "",
				"value" : ""
			}],
			"auxiliaryFields" : [{
				"key" : "blank2",
				"label" : "Arden Fair",
				"value" : ""
			}],
			"backFields" : [{
				"key" : "people",
				"label" : "Our People",
				"value" : "At Apple our most important resource, our soul, is our people.\n\nWe value dynamic, intelligent and interesting people who are passionate about Apple.\n\nWe offer a stimulating work environment, designed to create unparalleled career experiences and develop lifelong skills.\n\nWe value innovation and an environment that embraces change.\n\nWe celebrate our diversity, unique talents, and passion to strengthen the brand globally.\n\nWe are a community where great relationships, open communication , learning, leading, and growing serve to enrich our lives daily."
			}, {
				"key" : "customer",
				"label" : "Our Customer",
				"value" : "Our stores are designed to create owners of Apple products and build loyalty.\n\nWe cultivate the customers relationship with Apple through every interaction.  We say hello with a product introduction, we engage through a purchase, and we deepen and restore relationships through our face-to-face services.\n\nWe passionately engage customers, showcase our technology, and help them discover how our products can enrich their lives.\n\nWe strive to inspire customers with every visit so that our stores are a happy place to shop, to learn, to create, to get help, and to want to visit over and over again.\n\nWe are at our best when we deliver enriching experiences that help owners of our products get more out of our technology and out of themselves."
			}, {
				"key" : "daily",
				"label" : "Our Daily Commitment",
				"value" : "We utilize Apple Steps of Service to guide every interaction with our customers. \n\nWe engage our customers, making it easy to test-drive and learn how to use our products.\n\nWe are always up to date on Apples technology and integrate it wherever possible.\n\nWe earn our customers trust by recommending solutions that are relevant to their homes, their schools, and their businesses.\n\nWe exceed customers expectations, delivering all Genius Bar, Personal Training and workshop appointments in a timely, personalized, and efficient manner.\n\nWe embrace our One to One program as our primary strategy to help members get set up, get trained, and get going.\n\nWe build community through exciting programs for all customers through special events, hands-on workshops, and customized programs for Youth, Educators, Businesses, and our New to Mac buyers.\n\nWe utilize Net Promoter to monitor the employee and customer experience and to identify and address areas where we can better serve.\n\nWe encourage open dialogue with our people and customers to share ideas about improving our stores, our processes, and our performance.\n\nWe value each customer problem as an opportunity to shine.  \n\nWe listen and respond immediately to all feedback, taking personal initiative to make it right.\n\nWe maintain neat, clean, and organized stores in accordance with our visual standards.\n\nWe embrace and speak favorably of our coworkers, Apple Inc., our reseller channel, and third-party partners.\n\nWe value and strictly adhere to Apples confidentiality policies and brand guidelines. "
			}]
		}
	};
	
	
	$rootScope.SmartPass.coupon = {
		"formatVersion" : 1,
		"passTypeIdentifier" : "pass.myappmatrix.coupons",
		"serialNumber" : "E5982H-I2",
		"teamIdentifier" : "J62UV6D7WJ",
		"webServiceURL" : "http://localhost:3535/smartpass/v1",
		"authenticationToken" : "000000000012341234",
		"barcode" : {
			"message" : "123456789",
			"format" : "PKBarcodeFormatQR",
			"messageEncoding" : "iso-8859-1"
		},
		"locations" : [{
			"longitude" : -122.3748889,
			"latitude" : 37.6189722
		}],
		"organizationName" : "MyAppMatrix Coupon",
		"logoText" : "MyAppMatrix",
		"description" : "20% off any products",
		"foregroundColor" : "#111",
		"backgroundColor" : "#222",
		"coupon" : {
			"primaryFields" : [{
				"key" : "offer",
				"label" : "Any premium dog food",
				"value" : "20% off"
			}],
			"auxiliaryFields" : [{
				"key" : "starts",
				"label" : "STARTS",
				"value" : "Feb 5, 2013"
			}, {
				"key" : "expires",
				"label" : "EXPIRES",
				"value" : "March 5, 2012"
			}],
			"backFields" : [{
				"key" : "terms",
				"label" : "TERMS AND CONDITIONS",
				"value" : "Generico offers this pass, including all information, software, products and services available from this pass or offered as part of or in conjunction with this pass (the \"pass\"), to you, the user, conditioned upon your acceptance of all of the terms, conditions, policies and notices stated here. Generico reserves the right to make changes to these Terms and Conditions immediately by posting the changed Terms and Conditions in this location.\n\nUse the pass at your own risk. This pass is provided to you \"as is,\" without warranty of any kind either express or implied. Neither Generico nor its employees, agents, third-party information providers, merchants, licensors or the like warrant that the pass or its operation will be accurate, reliable, uninterrupted or error-free. No agent or representative has the authority to create any warranty regarding the pass on behalf of Generico. Generico reserves the right to change or discontinue at any time any aspect or feature of the pass."
			}]
		}
	};
 
	$scope.pass = $rootScope.SmartPass.coupon;
	$scope.order = 'updated';
	$scope.reverse = false;
	$scope.pass.type = 'coupon';
	/**
	 * UI Fixes
	 */
	$('input[type=text]').addClass('span12');
	//	$('.datepicker').datepicker();
	//	$('.timepicker').timepicker();
	angular.element('.colorpicker').colorpicker();
 
	console.log('RootScope', $rootScope, 'SmartPassModule', $rootScope.SmartPass);
};