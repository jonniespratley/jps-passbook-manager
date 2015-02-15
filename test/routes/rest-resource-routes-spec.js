var assert = require('assert'), path = require('path'), fs = require('fs-utils'), express = require('express'), request = require('supertest');

var require_helper = require('../../require_helper');
var config = require_helper('test/test-config');

var testPass = {
	"type": "eventTicket",
	"formatVersion": 1,
	"passTypeIdentifier": "pass.jsapps.io",
	"serialNumber": "123456",
	"teamIdentifier": "USE9YUYDFH",
	"webServiceURL": "https://example.com/passes/",
	"authenticationToken": "vxwxd7J8AlNNFPS8k0a0FfUFtq0ewzFdc",
	"relevantDate": "2011-12-08T13:00-08:00",
	"locations": [
		{
			"longitude": -122.3748889,
			"latitude": 37.6189722
		}
	],
	"barcode": {
		"message": "123456789",
		"format": "PKBarcodeFormatPDF417",
		"messageEncoding": "iso-8859-1"
	},
	"organizationName": "Apple Inc.",
	"description": "The Beat Goes On",
	"foregroundColor": "rgb(255, 255, 255)",
	"backgroundColor": "rgb(60, 65, 76)",
	"eventTicket": {
		"primaryFields": [
			{
				"key": "event",
				"label": "EVENT",
				"value": "The Beat Goes On"
			}
		],
		"secondaryFields": [
			{
				"key": "loc",
				"label": "LOCATION",
				"value": "Moscone West"
			}
		],
		"backFields": [
			{
				"key": "terms",
				"label": "TERMS AND CONDITIONS",
				"value": "Generico offers this pass, including all information, software, products and services available from this pass or offered as part of or in conjunction with this pass (the \"pass\"), to you, the user, conditioned upon your acceptance of all of the terms, conditions, policies and notices stated here. Generico reserves the right to make changes to these Terms and Conditions immediately by posting the changed Terms and Conditions in this location.\n\nUse the pass at your own risk. This pass is provided to you \"as is,\" without warranty of any kind either express or implied. Neither Generico nor its employees, agents, third-party information providers, merchants, licnsors or the like warrant that the pass or its operation will be accurate, reliable, uninterrupted or error-free. No agent or representative has the authority to create any warranty regarding the pass on behalf of Generico. Generico reserves the right to change or discontinue at any time any aspect or feature of the pass."
			}
		]
	},
	"updated": "20:25:38 GMT-0800 (PST)"
};



	var app = express();
var RestRoutes = require(path.resolve(__dirname, '../../routes/rest-resource-routes'));

RestRoutes(config, app);

app.listen(config.server.port, function () {
	console.log('test server running');
});

describe('rest-resource-routes', function () {

	it('POST - /api/v1/passes - should create pass', function (done) {
		request(app)
			.post('/api/v2/passbookmanager/passes')
			.send(testPass)
			.expect(201, done);
	});

	it('GET - /api/v1/passes - should return array of collection objects', function (done) {
		request(app)
			.get('/api/v2/passbookmanager/passes')
			.set('Accept', 'application/json')
			.expect(200, done);
	});

	it('GET - /api/v1/passes/pass.jsapps.io/123456', function (done) {
		request(app)
			.get('/api/v1/passes/pass.jsapps.io/123456')
			.end(function(err, res){
				if(err){
					assert.fail();
					done();
				}
				assert.ok(res.body, 'returns object');
				done();
			});
	});

	it('GET - /:col/:id - should return object', function (done) {
		request(app)
			.get('/api/v2/passbookmanager/devices')
			.expect(200, done);
	});
});

