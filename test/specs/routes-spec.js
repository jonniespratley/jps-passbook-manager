'use strict';
var assert = require('assert'),
	path = require('path'),
	fs = require('fs-extra'),
	request = require('supertest'),
	express = require('express'),
	os = require('os');


//Test vars
var testPassName = 'Test_Pass_';
var testPassDir = path.resolve(__dirname, '../../.tmp/');

var app = express();
var passes;

// TODO: Program
var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;
var db = program.db;
var config = program.config.defaults;

//Test Instances

var mockDevice = mocks.mockDevice;
var mockPass;


var jpsPassbook = require(path.resolve(__dirname, '..' + path.sep + '..' + path.sep + 'routes' + path.sep +
	'jps-passbook-routes'))(program, app);

describe('routes', function() {
	before(function(done) {
		program.models.Passes.getPasses().then(function(resp) {
			mockPass = resp[0];
			done();
		});
	});

	it('GET - /api/v1 - should return api', function(done) {
		request(app)
			.get('/api/v1')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});


	describe('Cert Routes', function() {
		it('/api/v1/passTypeIdentifier - should return user info', function(done) {
			request(app)
				.post('/api/v1/passTypeIdentifier')
				.field('passTypeIdentifier', mocks.mockIdentifer.passTypeIdentifier)
				.field('passphrase', mocks.mockIdentifer.passphrase)
				.attach('file', mocks.mockIdentifer.p12)
				.expect('Content-Type', /json/)
				.expect(200, done);
		});
	});

	describe('Auth Routes', function() {
		xit('/api/v1/me - should return user info', function(done) {
			request(app)
				.get('/api/v1/me')
				.expect('Content-Type', /json/)
				.expect(200, done);
		});
	});



	describe('Admin Passes', function() {


		it('POST - /api/v1/admin/passes - should create pass', function(done) {
			delete mockPass._id;
			request(app)
				.post('/api/v1/admin/passes')
				.send(mockPass)
				.expect(function(res) {
					//	mocks.mockPasses[0]._id = res.body._id;
					mockPass = res.body;
					console.log('create pass resp', res.body)
				})
				.expect('Content-Type', /json/)
				.expect(201, done);
		});


		it('GET - /api/v1/admin/passes - should return all passes', function(done) {
			request(app)
				.get('/api/v1/admin/passes')
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		it('POST - /api/v1/admin/passes - should create pass', function(done) {
			request(app)
				.post('/api/v1/admin/passes')
				.send(mocks.mockPass)
				.expect(function(res) {
					//	mocks.mockPasses[0]._id = res.body._id;
					//	mockPass = res;
					//	console.log(res)
				})
				.expect('Content-Type', /json/)
				.expect(201, done);
		});

		it('GET - /api/v1/admin/passes/:id - should return 1 pass', function(done) {
			request(app)
				.get('/api/v1/admin/passes/' + mockPass._id)
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		xit('GET - /api/v1/register/:token - add device to db', function(done) {
			request(app)
				.get('/api/v1/register/' + mockDevice.token)
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		it('GET - /api/v1/push/:token - send push to device', function(done) {
			request(app)
				.get('/api/v1/push/' + mockDevice.token)
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		xit('DELETE - /api/v1/admin/passes/:id - should remove pass', function(done) {
			request(app)
				.delete('/api/v1/admin/passes/' + mocks.mockPass._id)
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

	});

	describe('Download/Sign', function() {

		it('GET - /api/v1/sign/:id - should sign pass', function(done) {
			request(app)
				.get(`/api/v1/sign/${mockPass._id}`)
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		it('GET - /api/v1/download/:id - should export pass', function(done) {
			request(app)
				.get(`/api/v1/download/${mockPass._id}`)
				.expect('Content-Type', /application\/vnd.apple.pkpass/)
				.expect(200, done);
		});

	});


	describe('DB Routes', function() {

		xit('GET - /api/v1/db/passbookmanager/_changes - should return db info', function(done) {
			request(app)
				.get('/api/v1/db/passbookmanager/_changes')
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		xit('GET - /api/v1/db/passbookmanager/_all_docs - should return all docs', function(done) {
			request(app)
				.get('/api/v1/db/passbookmanager/_all_docs')
				.expect('Content-Type', /json/)
				.expect(function(res) {

					passes = res.body.rows;
					console.log(passes)
				})
				.expect(200, done);
		});

		it('PUT - /api/v1/db/passbookmanager/:id - should create doc', function(done) {
			request(app)
				.put('/api/v1/db/passbookmanager/' + mockPass._id)
				.send(mockPass)
				.expect('Content-Type', /json/)
				.expect(201, done);
		});

		it('GET - /api/v1/db/passbookmanager/:id - should get doc', function(done) {
			request(app)
				.get('/api/v1/db/passbookmanager/' + mockPass._id)
				.expect('Content-Type', /json/)
				.expect(function(res) {
					assert(res.body._id === mockPass._id);
					mockPass = res.body;
				})
				.expect(200, done);
		});

		it('DELETE - /api/v1/db/passbookmanager/:id - should remove doc', function(done) {
			request(app)
				.delete('/api/v1/db/passbookmanager/' + mockPass._id + '?rev=' + mockPass._rev)
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

	});


	describe('PassKit Web Service', function() {

		beforeEach(function() {
			//console.log('Using Device', mockDevice);
			//console.log('Using Pass', mockPass);

		});
		describe('Devices', function() {
			it(
				'POST - /api/v1/devices/:device_id/registrations/:pass_type_id/:serial_number - register a new device for pass',
				function(done) {
					request(app)
						.post(
							//'/api/v1/devices/012345678987654321/registrations/pass.jsapps.io/012345678987654321'
							`/api/v1/devices/${mockDevice.deviceLibraryIdentifier}/registrations/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}`
						)
						.send({
							pushToken: mockDevice.pushToken
						})
						.set('Authorization', mockDevice.authorization)
						.expect('Content-Type', /json/)
						.expect(201, done);
				});

			it(
				'POST - /api/v1/devices/:device_id/registrations/:pass_type_id/:serial_number - return existing device for pass',
				function(done) {
					request(app)
						.post(
							//'/api/v1/devices/012345678987654321/registrations/pass.jsapps.io/012345678987654321'
							`/api/v1/devices/${mockDevice.deviceLibraryIdentifier}/registrations/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}`
						)
						.send({
							pushToken: mockDevice.pushToken
						})
						//.set('Authorization', 'ApplePass ' + mockPass.authenticationToken)
						.set('Authorization', mockDevice.authorization)
						.expect('Content-Type', /json/)
						.expect(200, done);
				});

			it('GET - /api/v1/devices/:device_id/push/:token - send push to device', function(done) {
				request(app)
					.get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/push/' + mockDevice.token)
					.set('Authorization', mockDevice.authorization)
					.expect('Content-Type', /json/)
					.expect(200, done);
			});

			it('GET - /api/v1/devices/:device_id/registrations/:pass_type_id - get serial numbers',
				function(done) {
					request(app)
						.get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/registrations/' + mockPass.passTypeIdentifier)
						.set('Authorization', mockDevice.authorization)
						.expect('Content-Type', /json/)
						.expect(200, done);
				});

			it('GET - /api/v1/devices/:device_id/registrations/:pass_type_id?passesUpdatedSince=tag - get serial numbers',
				function(done) {
					request(app)
						.get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/registrations/' + mockPass.passTypeIdentifier +
							'?tag=now')
						.set('Authorization', mockDevice.authorization)
						.expect('Content-Type', /json/)
						.expect(200, done);
				});

			it('GET - /api/v1/devices/:device_id/:registrations/:pass_type_id', function(done) {
				request(app)
					.get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/registrations/' + mockPass.passTypeIdentifier)
					.set('Authorization', mockDevice.authorization)
					.expect('Content-Type', /json/)
					.expect(function(res) {
						assert.ok(res.body.serialNumbers);
					})
					.expect(200, done);
			});

			it('DELETE - /api/v1/devices/:device_id/:pass_type_id/:serial_number - un-register device',
				function(done) {
					request(app)
						.delete(
							`/api/v1/devices/${mockDevice.deviceLibraryIdentifier}/registrations/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}`
						)
						.set('Authorization', mockDevice.authorization)
						//.expect('Content-Type', /json/)
						.expect(200, done);
				});
		});

		describe('Passes', function() {

			it('GET - /api/v1/passes/:pass_type_id/:serial_number - 401', function(done) {
				request(app)
					.get(`/api/v1/passes/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}111`)
					.expect(401, done);
			});

			it('GET - /api/v1/passes/:pass_type_id/:serial_number', function(done) {
				request(app)
					.get(`/api/v1/passes/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}`)
					.set('Authorization', mockDevice.authorization)
					//.expect('Content-Type', /application\/vnd.apple.pkpass/)
					.expect(200, done);

			});

			it('GET - /api/v1/passes/:pass_type_id/:serial_number - 204 - No matching passes', function(done) {
				request(app)
					.get(`/api/v1/passes/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}?passesUpdatedSince=`)
					.set('Authorization', mockDevice.authorization)
					//.expect('Content-Type', /application\/vnd.apple.pkpass/)
					.expect(204, done);

			});
		});

		it('POST - /api/v1/log - should store logs', function(done) {
			this.slow(5000);
			request(app)
				.post('/api/v1/log')
				.send({
					logs: ['test log']
				})
				.expect('Content-Type', /json/)
				.expect(200, done);
		});



		it('GET - /api/v1/admin/find?docType=device - should return devices', function(done) {
			request(app)
				.get('/api/v1/admin/find?docType=device')
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		it('GET - /api/v1/admin/find?docType=log - should return logs', function(done) {
			request(app)
				.get('/api/v1/admin/find?docType=log')
				.expect('Content-Type', /json/)
				.expect(200, done);
		});


	});
});
