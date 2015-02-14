var assert = require('assert'),
	path = require('path'),
	fs = require('fs-utils'),
	express = require('express'),
	request = require('supertest');


var require_helper = require('../../require_helper');
var config = require_helper('test/test-config');

//Initialize the REST resource server with our configuration object.
var app = express();
var PassbookRoutes = require_helper('routes/jps-passbook-routes');

PassbookRoutes(config, app);
app.listen(config.server.port, function () {
	console.log('test server running');
});

var testDevice = {
	"deviceLibraryIdentifier" : "123456" ,
	"passTypeIdentifier" : "pass.jsapps.io" ,
	"serialNumber" : "ABCD-123" ,
	"pushToken" : "8701addcd7c847b07776c95883b779243527c5b959b12f81658d74fe2c1938fd",
	"authToken" : "ApplePass vxwxd7J8AlNNFPS8k0a8FfUFtq0ewzFdc"
};


describe('jps-passbook-routes', function () {

	it('should register a device for updates', function (done) {
		//
		done();
	});
	it('should get changes for a device', function (done) {
		//
		done();
	});
	it('should get passes for a device', function (done) {
		//
		done();
	});
	it('should unregister a device for updates', function (done) {
		//
		done();
	});

	//SELECT * FROM DEVICES WHERE :deviceId
	//'/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber'
	it('POST - /api/v1/devices/123456/registrations/pass.jsapps.io/ABCD-123 - should return serialNumbers and lastUpdated', function (done) {
		request(app)
			.post('/api/v1/devices/123456/registrations/pass.jsapps.io/ABCD-123')
			.send(testDevice)
			.expect(200, done);
	});

	it('GET - /api/v1/devices/123456/registrations/pass.jsapps.io/ABCD-123 - should return serialNumbers and lastUpdated', function (done) {
		request(app)
			.get('/api/v1/devices/123456/registrations/pass.jsapps.io/ABCD-123')
			.expect(200, done);
	});

	it('DELETE - /api/v1/devices/123456/registrations/pass.jsapps.io/ABCD-123 - should return serialNumbers and lastUpdated', function (done) {
		request(app)
			.del('/api/v1/devices/123456/registrations/pass.jsapps.io/ABCD-123')
			.expect(200, done);
	});


});
