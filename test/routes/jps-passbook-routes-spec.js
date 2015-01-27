var assert = require('assert'),
	path = require('path'),
	fs = require('fs-utils'),
	express = require('express'),
	request = require('supertest');


//mongodb://admin:admin@ds031611.mongolab.com:31611/passbookmanager
var config = {
	name: 'passbookmanager',
	message: 'Passbook Manager API Server',
	version: 'v1',
	security: {
		salt: 'a58e325c6df628d07a18b673a3420986'
	},
	server: {
		host: 'localhost',
		port: 4142
	},
	db: {
		username: 'demouser',
		password: 'demopassword',
		host: 'ds031611.mongolab.com',
		port: 31611,

		url: 'mongodb://localhost:27017/passbookmanager'
	},
	collections: ['devices', 'passes', 'notifications', 'settings'],
	staticDir: './app',
	publicDir: __dirname + path.sep + 'www/public',
	uploadsTmpDir: __dirname + path.sep + '.tmp',
	uploadsDestDir: __dirname + path.sep + 'www/public'
};

//Initialize the REST resource server with our configuration object.
var app = express();
//var PassbookRoutes = require(path.resolve(__dirname, '../../routes/jps-passbook-routes.js'))(config, app);

app.listen(config.server.port, function () {
	console.log('test server running');
});

describe('jps-passbook-routes', function () {
	it('GET - api/v1/v1/devices - should return object with serialNumbers and lastUpdated', function (done) {
		request(app)
			.get('/api/v1/v1/devices/ae08f43d52d750802f4486335ca93857/registrations/pass.jsapps.io/123456')
			.expect(200, done);
	});
});
