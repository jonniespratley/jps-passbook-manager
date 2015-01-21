var assert = require('assert'), path = require('path'), fs = require('fs-extra'), os = require('os');

//3rd Party
var request = require('supertest'), express = require('express');

//Test vars
var testPassName = 'Test_Pass_';
var testPassDir = path.resolve(__dirname, '../../.tmp/');
var config = fs.readJsonSync(path.resolve(__dirname, '../../config/config.js'));

//Test Instances
var app = express();
var jpsPassbook = require(path.resolve(__dirname, '..' + path.sep + '..' + path.sep + 'routes'+ path.sep +'jps-passbook-routes'))(config, app);

describe('jps-passbook-routes', function () {

	it('GET - /api/v1 - should return api index', function (done) {
		request(app)
			.get('/api/v1')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});
});
