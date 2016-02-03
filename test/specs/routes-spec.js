'use strict';
const assert = require('assert');
const path = require('path');
const request = require('supertest');
const express = require('express');

//Test vars
var testPassName = 'Test_Pass_';
var testPassDir = path.resolve(__dirname, '../../.tmp/');

var app = express();
var passes;

// TODO: Program
var mocks = require(path.resolve(__dirname, '../helpers/mocks'));

const program = mocks.program;

//Test Instances
var mockDevice = mocks.mockDevice;
var mockPass = mocks.mockPass;


describe('routes', function() {

	it('GET - /api/v1 - should return api', function(done) {
		request(app)
			.get('/api/v1')
			.expect('Content-Type', /json/)
			.expect(200, done);
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

		describe('Logs', function() {
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

			it('GET - /api/v1/passes/:pass_type_id/:serial_number - ?updated since date', function(done) {
				request(app)
					.get(`/api/v1/passes/${mockPass.passTypeIdentifier}/${mockPass.serialNumber}?updatedSince=` + Date.now())
					.set('Authorization', mockDevice.authorization)
					//.expect('Content-Type', /application\/vnd.apple.pkpass/)
					.expect(204, done);

			});
		});





	});
});
