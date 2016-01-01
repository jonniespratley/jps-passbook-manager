var assert = require('assert'), path = require('path'), fs = require('fs-extra'), os = require('os');

//3rd Party
var request = require('supertest'), express = require('express');

//Test vars
var testPassName = 'Test_Pass_';
var testPassDir = path.resolve(__dirname, '../../.tmp/');
var config = fs.readJsonSync(path.resolve(__dirname, '../../config/config.json'));
var app = express();

// TODO: Program
var program = require(path.resolve(__dirname, '../../lib/program.js'))(config);

//Test Instances

var jpsPassbook = require(path.resolve(__dirname, '..' + path.sep + '..' + path.sep + 'routes'+ path.sep +'jps-passbook-routes'))(program, app);

describe('jps-passbook-routes', function () {
	it('should have config', function(){
		assert(program.config);
		console.log(program.config);
	})

	it('GET - /api/v1 - should return api', function (done) {
		request(app)
			.get('/api/v1')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});
	it('GET - /api/v1/log - should return drain log', function (done) {
		request(app)
			.get('/api/v1/log')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});
	it('GET - /api/v1/register/:token - add device to db', function (done) {
		request(app)
			.get('/api/v1/register/12345678')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});
	it('GET - /api/v1/push/:token - send push to device', function (done) {
		request(app)
			.get('/api/v1/push/12345678')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});
});
