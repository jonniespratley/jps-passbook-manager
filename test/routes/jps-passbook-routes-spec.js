'use strict';
var assert = require('assert'),
	path = require('path'),
	fs = require('fs-extra'),
	os = require('os');

//3rd Party
var request = require('supertest'),
	express = require('express');

//Test vars
var testPassName = 'Test_Pass_';
var testPassDir = path.resolve(__dirname, '../../.tmp/');
var config = fs.readJsonSync(path.resolve(__dirname, '../../config.json'));
var app = express();
var passes;
// TODO: Program
var program = require(path.resolve(__dirname, '../../lib/program.js'))(config);

//Test Instances
var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var mockDevice = mocks.mockDevice;
var mockPass = mocks.mockPass;

var jpsPassbook = require(path.resolve(__dirname, '..' + path.sep + '..' + path.sep + 'routes' + path.sep +
	'jps-passbook-routes'))(program, app);

describe('jps-passbook-routes', function () {
	it('should have templates', function () {
		assert(program.config);
		console.log(program.config);
	})

	it('GET - /api/v1 - should return api', function (done) {
		request(app)
			.get('/api/v1')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});

	it('GET - /api/v1/passes - should return passes', function (done) {
		request(app)
			.get('/api/v1/passes')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});

	it('GET - /api/v1/devices - should return devices', function (done) {
		request(app)
			.get('/api/v1/devices')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});

	xit('GET - /api/v1/registrations - should return registrations', function (done) {
		request(app)
			.get('/api/v1/registrations')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});


	describe('DB Routes', function () {

		xit('GET - /api/v1/db/passbookmanager/_changes - should return db info', function (done) {
			request(app)
				.get('/api/v1/db/passbookmanager/_changes')
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		xit('GET - /api/v1/db/passbookmanager/_all_docs - should return all docs', function (done) {
			request(app)
				.get('/api/v1/db/passbookmanager/_all_docs')
				.expect('Content-Type', /json/)
				.expect(function (res) {

					passes = res.body.rows;
					console.log(passes)
				})
				.expect(200, done);
		});

		it('PUT - /api/v1/db/passbookmanager/:id - should create doc', function (done) {
			request(app)
				.put('/api/v1/db/passbookmanager/' + mockPass._id)
				.send(mockPass)
				.expect('Content-Type', /json/)
				.expect(201, done);
		});

		it('GET - /api/v1/db/passbookmanager/:id - should get doc', function (done) {
			request(app)
				.get('/api/v1/db/passbookmanager/' + mockPass._id)
				.expect('Content-Type', /json/)
				.expect(function (res) {
					assert(res.body._id === mockPass._id);
					mockPass = res.body;
				})
				.expect(200, done);
		});

		it('DELETE - /api/v1/db/passbookmanager/:id - should remove doc', function (done) {
			request(app)
				.delete('/api/v1/db/passbookmanager/' + mockPass._id + '?rev=' + mockPass._rev)
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

	});

	xit('GET - /api/v1/export/:id - should export pass', function (done) {
		request(app)
			.get('/api/v1/export/' + mockPass._id)
			.expect('Content-Type', /json/)
			.expect(200, done);
	});
	xit('GET - /api/v1/sign/:id - should sign pass', function (done) {
		request(app)
			.get('/api/v1/sign/' + mockPass._id)
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

		describe('Devices', function () {
			it(
				'POST - /api/v1/devices/:device_id/registrations/:pass_type_id/:serial_number - register a device to receive push notifications for a pass',
				function (done) {
					request(app)
						.post(
							`/api/v1/devices/${mockDevice._id}/registrations/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}`)
						.send({
							pushToken: '123456789'
						})
						.set('Authorization', 'ApplePass ' + mockPass.authenticationToken)
						.expect('Content-Type', /json/)
						.expect(201, done);
				});

			it('GET - /api/v1/devices/:device_id/push/:token - send push to device', function (done) {
				request(app)
					.get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/push/' + mockDevice.token)
					.set('Authorization', 'ApplePass ' + mockPass.authenticationToken)
					.expect('Content-Type', /json/)
					.expect(200, done);
			});


			it('GET - /api/v1/devices/:device_id/registrations/:pass_type_id - get serial numbers',
				function (done) {
					request(app)
						.get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/registrations/' + mockPass.passTypeIdentifier +
							'?passesUpdatedSince=')
						.set('Authorization', 'ApplePass ' + mockPass.authenticationToken)
						.expect('Content-Type', /json/)
						.expect(200, done);
				});



			it(
				'GET - /api/v1/devices/:device_id/:registrations/:pass_type_id?passesUpdatedSince=' +
				Date.now(),
				function (done) {
					request(app)
						.get('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/registrations/' + mockPass.passTypeIdentifier +
							'?passesUpdatedSince=')
						.expect('Content-Type', /json/)
						.set('Authorization', 'ApplePass ' + mockPass.authenticationToken)
						.expect(function (res) {
							assert.ok(res.body.lastUpdated);
							assert.ok(res.body.serialNumbers);

						})
						.expect(200, done);
				});
			it('DELETE - /api/v1/devices/:device_id/:pass_type_id/:serial_number - unregister device',
				function (done) {
					request(app)
						.delete('/api/v1/devices/' + mockDevice.deviceLibraryIdentifier + '/' + mockPass.passTypeIdentifier + '/' +
							mockPass.serialNumber)
						.set('Authorization', 'ApplePass ' + mockPass.authenticationToken)
						.expect('Content-Type', /json/)
						.expect(200, done);
				});
		});
		describe('Passes', function () {
			it('GET - /api/v1/passes/:pass_type_id/:serial_number', function (done) {
				request(app)
					.get('/api/v1/passes/' + mockPass.passTypeIdentifier + '/' + mockPass.serialNumber)
					//.expect('Content-Type', /json/)
					.expect(401, done);
			});

			it('GET - /api/v1/passes/:pass_type_id/:serial_number', function (done) {
				request(app)
					.get('/api/v1/passes/' + mockPass.passTypeIdentifier + '/' + mockPass.serialNumber + '')
					//.set('Accept', 'application/json')
					.set('Authorization', 'ApplePass ' + mockPass.authenticationToken)
					//.expect('Content-Type', /application\/vnd.apple.pkpass/)
					.expect(200)
					.end(function (err, res) {
						if (err) {
							return done(err)
						}
						done();
					});
			});
		});

		it('POST - /api/v1/log - should store logs', function (done) {
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
