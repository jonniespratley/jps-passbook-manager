var assert = require('assert'), path = require('path'), fs = require('fs-extra'), os = require('os');

//3rd Party
var request = require('supertest'), express = require('express');

//Test vars
var testPassName = 'Test_Pass_';
var testPassDir = path.resolve(__dirname, '../../.tmp/');
var config = fs.readJsonSync(path.resolve(__dirname, '../../config/config.json'));
var app = express();
var passes;
// TODO: Program
var program = require(path.resolve(__dirname, '../../lib/program.js'))(config);

//Test Instances
var mockDevice = {
	deviceLibraryIdentifier: 'jps',
	token: '12345'
};
var mockPass = {
	_id: "pass-E5982H-"+ Date.now(),
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

var jpsPassbook = require(path.resolve(__dirname, '..' + path.sep + '..' + path.sep + 'routes' + path.sep + 'jps-passbook-routes'))(program, app);

describe('jps-passbook-routes', function () {
	it('should have config', function () {
		assert(program.config);
		console.log(program.config);
	})

	it('GET - /api/v1 - should return api', function (done) {
		request(app)
			.get('/api/v1')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});


	describe('DB Routes', function(){

		it('GET - /api/v1/db/passbookmanager/_changes - should return db info', function (done) {
			request(app)
				.get('/api/v1/db/passbookmanager/_changes')
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		it('GET - /api/v1/db/passbookmanager/_all_docs - should return all docs', function (done) {
			request(app)
				.get('/api/v1/db/passbookmanager/_all_docs')
				.expect('Content-Type', /json/)
				.expect(function(res) {

					passes = res.body.rows;
					console.log(passes)
				})
				.expect(200, done);
		});

		it('PUT - /api/v1/db/passbookmanager/:id - should create doc', function (done) {
			request(app)
				.put('/api/v1/db/passbookmanager/'+ mockPass._id)
				.send(mockPass)
				.expect('Content-Type', /json/)
				.expect(201, done);
		});

		it('GET - /api/v1/db/passbookmanager/:id - should get doc', function (done) {
			request(app)
				.get('/api/v1/db/passbookmanager/'+ mockPass._id)
				.expect('Content-Type', /json/)
				.expect(function(res) {
					assert(res.body._id === mockPass._id);
					mockPass = res.body;
				})
				.expect(200, done);
		});

		it('DELETE - /api/v1/db/passbookmanager/:id - should remove doc', function (done) {
			request(app)
				.delete('/api/v1/db/passbookmanager/'+ mockPass._id +'?rev='+mockPass._rev)
				.expect('Content-Type', /json/)
				.expect(200, done);
		});


	});

	it('GET - /api/v1/sign/:id - should sign pass', function (done) {
		request(app)
			.get('/api/v1/sign/' + mockPass._id)
			.expect('Content-Type', /json/)
			.expect(200, done);
	});
	it('GET - /api/v1/export/:id - should export pass', function (done) {
		request(app)
			.get('/api/v1/export/' + mockPass._id)
			.expect('Content-Type', /json/)
			.expect(200, done);
	});

	it('GET - /api/v1/register/:token - add device to db', function (done) {
		request(app)
			.get('/api/v1/register/' + mockDevice.deviceLibraryIdentifier)
			.expect('Content-Type', /json/)
			.expect(200, done);
	});

	it('GET - /api/v1/push/:token - send push to device', function (done) {
		request(app)
			.get('/api/v1/push/' + mockDevice.token)
			.expect('Content-Type', /json/)
			.expect(200, done);
	});

	describe('PassKit Web Service', function () {

		it('POST - /api/v1/log - should return drain log', function (done) {
			request(app)
				.post('/api/v1/log')
				.send({
					logs: ['test	']
				})
				.expect('Content-Type', /json/)
				.expect(200, done);
		});
		xit('GET - /api/v1/passes/:passTypeId/:serial - get latest version of pass', function (done) {
			request(app)
				.get('/api/v1/passes/' + mockPass.passTypeIdentifier + '/' + mockPass.serialNumber)
				.expect('Content-Type', /application\/vnd.apple.pkpass/)
				.expect(200, done);
		});

		it('GET - /api/v1/devices/:deviceLibraryIdentifier/push/:token - send push to device', function (done) {
			request(app)
				.get('/api/v1/devices/' + mockPass.passTypeIdentifier + '/push/' + mockDevice.token)
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		it('DELETE - /api/v1/devices/:deviceLibraryIdentifier/:passTypeIdentifier/:serialNumber - unregister device', function (done) {
			request(app)
				.delete('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/' + mockPass.passTypeIdentifier + '/' + mockPass.serialNumber)
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		it('POST - /api/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber - register pass', function (done) {
			request(app)
				.post('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/registrations/' + mockPass.passTypeIdentifier + '/' + mockPass.serialNumber)
				.send(mockDevice)
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		it('GET - /api/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier - get serial numbers', function (done) {
			request(app)
				.get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/registrations/' + mockPass.passTypeIdentifier + '?passesUpdatedSince=')
				.expect('Content-Type', /json/)
				.expect(200, done);
		});
	});
});
