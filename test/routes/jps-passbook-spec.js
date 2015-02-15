var assert = require('assert'), path = require('path'), fs = require('fs-utils');
var os = require('os');
var jpsPassbook = require(path.resolve(__dirname, '../../routes/jps-passbook'));
var testPassName = 'Test_Pass_';
var testPassDir = path.resolve(__dirname, '../../.tmp/www');
var testPass = {
	"formatVersion" : 1,
	"passTypeIdentifier" : "pass.jsapps.io",
	"serialNumber" : "123456",
	"teamIdentifier" : "USE9YUYDFH",
	"webServiceURL" : "https://passbook-manager.jsapps.io/api/v1",
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
	"organizationName" : "JPS",
	"logoText" : "Logo",
	"description" : "CouponSpec",
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
		}],
		"backFields" : [{
			"key" : "terms",
			"label" : "TERMS AND CONDITIONS",
			"value" : "This is the terms"
		}]
	},
	"type" : "coupon",
	"updated" : "2015-01-19T17:04:34.845Z"
};

var testPassfile = '';

describe('jps-passbook', function() {
	beforeEach(function(done) {
		//fs.mkdir(testPassDir);
		done();
	});
	afterEach(function(done) {
		//fs.del(testPassDir);
		done();
	});



	xit('should create a pass file, a directory with .raw and a pass.json', function(done) {
		testPass.description = testPassName;
		var options = {
			path: testPassDir,
			pass: testPass
		};

		jpsPassbook.createPass(options).then(function(data) {
			assert.equal(data.path, testPassDir + path.sep + testPass.organizationName + '-' + testPass.description + '.raw');
			testPassDir = data.directory;
			done();
		}, function(err){
			assert.fail(err);
			done();
		});
	});


	it('should create a custom named pass file, a directory with .raw and a pass.json', function(done) {
		testPass.description = testPassName;
		var options = {
			path: testPassDir,
			pass: testPass,
			filename: 'My-Test-Pass'
		};
		jpsPassbook.createPass(options).then(function(data) {
			assert.equal(data.filename, 'My-Test-Pass.raw');
			testPassDir = data.path;
			done();
		}, function(err){
			assert.fail(err);
			done();
		});
	});


	it('should sign a pass', function(done) {
		jpsPassbook.signPass(testPassDir).then(function(pass) {
			assert.ok(pass, 'returns pass location');
			done();
		}, function(err){
			assert.fail(err);
			done();
		});

	});
});
