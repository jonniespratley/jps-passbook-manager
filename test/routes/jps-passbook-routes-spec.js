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

describe('jps-passbook-routes', function () {
	it('GET - api/v1/devices - should return object with serialNumbers and lastUpdated', function (done) {
		request(app)
			.get('/api/v1/devices/ae08f43d52d750802f4486335ca93857/registrations/pass.jsapps.io/123456')
			.expect(200, done);
	});
});
