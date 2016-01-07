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
var program = require(path.resolve(__dirname, '../../lib/program.js'))();
var config = program.config.defaults;

//Test Instances
var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var mockDevice = mocks.mockDevice;
var mockPass = mocks.mockPass;

var jpsPassbook = require(path.resolve(__dirname, '..' + path.sep + '..' + path.sep + 'routes' + path.sep +
	'jps-passbook-routes'))(program, app);

describe('program routes', function() {

	it('GET - /api/v1 - should return api', function(done) {
		request(app)
			.get('/api/v1')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});

	describe('Admin Passes', function() {

		it('GET - /api/v1/admin/passes - should return all passes', function(done) {
			request(app)
				.get('/api/v1/admin/passes')
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		it('POST - /api/v1/admin/passes - should create pass', function(done) {
			request(app)
				.post('/api/v1/admin/passes')
				.send(mocks.mockPasses[0])
				.expect(function(res) {
					mocks.mockPasses[0]._id = res.body._id;
					//	console.log(res)
				})
				.expect('Content-Type', /json/)
				.expect(201, done);
		});

		it('GET - /api/v1/admin/passes/:id - should return 1 pass', function(done) {
			request(app)
				.get('/api/v1/admin/passes/' + mocks.mockPasses[0]._id)
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		it('GET - /api/v1/export/:id - should export pass', function(done) {
			request(app)
				.get('/api/v1/export/' + mocks.mockPasses[0]._id)
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		it('GET - /api/v1/sign/:id - should sign pass', function(done) {
			request(app)
				.get('/api/v1/sign/' + mocks.mockPasses[0]._id)
				.expect('Content-Type', /application\/vnd.apple.pkpass/)
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


		it('DELETE - /api/v1/admin/passes/:id - should remove pass', function(done) {
			request(app)
				.delete('/api/v1/admin/passes/' + mocks.mockPasses[0]._id)
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

	});

	xit('GET - /api/v1/devices - should return devices', function(done) {
		request(app)
			.get('/api/v1/devices')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});

	xit('GET - /api/v1/registrations - should return registrations', function(done) {
		request(app)
			.get('/api/v1/registrations')
			.expect('Content-Type', /json/)
			.expect(200, done);
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

		describe('Devices', function() {
			it('POST - /api/v1/devices/:device_id/registrations/:pass_type_id/:serial_number - register device for pass',
				function(done) {
					request(app)
						.post(
							`/api/v1/devices/${mockDevice._id}/registrations/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}`
						)
						.send({
							pushToken: mockDevice.pushToken
						})
						.set('Authorization', mockPass.authenticationToken)
						.expect('Content-Type', /json/)
						.expect(201, done);
				});

			it('GET - /api/v1/devices/:device_id/push/:token - send push to device', function(done) {
				request(app)
					.get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/push/' + mockDevice.token)
					.set('Authorization', mockPass.authenticationToken)
					.expect('Content-Type', /json/)
					.expect(200, done);
			});

			it('GET - /api/v1/devices/:device_id/registrations/:pass_type_id - get serial numbers',
				function(done) {
					request(app)
						.get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/registrations/' + mockPass.passTypeIdentifier)
						.set('Authorization', mockPass.authenticationToken)
						.expect('Content-Type', /json/)
						.expect(200, done);
				});
			it('GET - /api/v1/devices/:device_id/registrations/:pass_type_id?passesUpdatedSince=tag - get serial numbers',
				function(done) {
					request(app)
						.get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/registrations/' + mockPass.passTypeIdentifier +
							'?tag=now')
						.set('Authorization', mockPass.authenticationToken)
						.expect('Content-Type', /json/)
						.expect(200, done);
				});

			it('GET - /api/v1/devices/:device_id/:registrations/:pass_type_id', function(done) {
				request(app)
					.get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/registrations/' + mockPass.passTypeIdentifier)
					.set('Authorization', mockPass.authenticationToken)
					.expect('Content-Type', /json/)
					.expect(function(res) {
						assert.ok(res.body.serialNumbers);
					})
					.expect(200, done);
			});

			xit('DELETE - /api/v1/devices/:device_id/:pass_type_id/:serial_number - unregister device',
				function(done) {
					request(app)
						.delete('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/' + mockPass.passTypeIdentifier + '/' +
							mockPass.serialNumber)
						.set('Authorization', mockPass.authenticationToken)
						.expect('Content-Type', /json/)
						.expect(200, done);
				});
		});

		describe('Passes', function() {

			it('GET - /api/v1/passes/:pass_type_id/:serial_number - 401', function(done) {
				request(app)
					.get('/api/v1/passes/' + mockPass.passTypeIdentifier + '/' + mockPass.serialNumber)
					.expect(401, done);
			});

			it('GET - /api/v1/passes/:pass_type_id/:serial_number', function(done) {
				request(app)
					.get('/api/v1/passes/' + mockPass.passTypeIdentifier + '/' + mockPass.serialNumber + '')
					.set('Authorization', mockPass.authenticationToken)
					//.expect('Content-Type', /application\/vnd.apple.pkpass/)
					.expect(200, done);

			});

			xit('GET - /api/v1/passes/:pass_type_id/:serial_number - 204 - No matching passes', function(done) {
				request(app)
					.get('/api/v1/passes/' + mockPass.passTypeIdentifier + '/test?passesUpdatedSince=now')
					.set('Authorization', mockPass.authenticationToken)
					//.expect('Content-Type', /application\/vnd.apple.pkpass/)
					.expect(204, done);

			});
		});

		it('POST - /api/v1/log - should store logs', function(done) {
			request(app)
				.post('/api/v1/log')
				.send({
					logs: ['test log']
				})
				.expect('Content-Type', /json/)
				.expect(200, done);
		});


	});
});
