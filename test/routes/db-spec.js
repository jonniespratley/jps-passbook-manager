/**
 * Created by jps on 12/17/15.
 */
var assert = require('assert'),
	path = require('path'),
	fs = require('fs-extra'),
	os = require('os');


//Test vars
var testPassName = 'Test_Pass_';
var testPassDir = path.resolve(__dirname, '../../.tmp/');
var config = fs.readJsonSync(path.resolve(__dirname, '../../config.json'));


// TODO: Program
var program = require(path.resolve(__dirname, '../../lib/program.js'))(config);

var db = program.db;
//Test Instances
var mockDevice = {
	deviceLibraryIdentifier: 'jps',
	token: '12345'
};
var mockPass = {
	_id: "pass-E5982H-" + Date.now(),
	"formatVersion": 1,
	"passTypeIdentifier": "pass.passbookmanager.io",
	"serialNumber": "E5982H-I2",
	"teamIdentifier": "USE9YUYDFH",
	"webServiceURL": config.webServiceURL,
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
	"organizationName": "Coupon",
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
}

describe('db', function () {
	it('should be defined', function () {
		assert(db);
		console.log(db);
	});

	it('should create file with generated id', function (done) {
		db.post({
			title: 'test'
		}).then(function (resp) {
			assert(resp);
			done();
		})
	});

	it('should create file with id', function (done) {
		db.put(mockPass).then(function (resp) {
			assert(resp);
			done();
		});
	});

	it('should get file with id', function (done) {
		db.get(mockPass._id).then(function (resp) {
			assert(resp);
			done();
		});
	});


	it('file store', function (done) {
		var Store = require("jfs");
		var db = new Store("db");

		var d = mockPass;

// save with custom ID
		db.save(mockPass._id, d, function (err) {
			// now the data is stored in the file data/anId.json
		});

// save with generated ID
		db.save(d, function (err, id) {
			// id is a unique ID
			done();
		});

	});

});
