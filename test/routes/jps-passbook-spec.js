var assert = require('assert'), path = require('path'), fs = require('fs-utils');
var os = require('os');
var jpsPassbook = require(path.resolve(__dirname, '../../routes/jps-passbook'));
var testPassName = 'Test_Pass_';
var testPassDir = path.resolve(__dirname, '../../.tmp/');
var testPass = {
	"_id" : "54bd3924e8d30273263d8f64",
	"mode" : "edit",
	"formatVersion" : 1,
	"passTypeIdentifier" : "pass.jsapps.io",
	"serialNumber" : "f45b1a3b-aa94-cacf-eddf-679db4e701c3",
	"teamIdentifier" : "J62UV6D7WJ",
	"webServiceURL" : "http://localhost:1333/smartpass/v1",
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
	"organizationName" : " Coupon",
	"logoText" : "Logo",
	"description" : "Test Coupon",
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

	it('should create a pass file with .raw appended', function(done) {
		testPass.description = testPassName;
		jpsPassbook.createPass(testPassDir, testPass, function(data) {
			assert.equal(data.filename, testPassDir + path.sep + testPass.description + '.raw');
			testPassDir = data.directory;
			done();
		});
	});

	it('should sign a pass', function(done) {
		jpsPassbook.signPass(testPassDir, function(pass) {
			assert.ok(pass, 'returns pass location');
			done();
		});

	});
});
