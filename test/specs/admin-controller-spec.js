'use strict';
const path = require('path');
const _ = require('lodash');
const assert = require('assert');
const request = require('supertest');
const express = require('express');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const program = mocks.program;
const AdminController = program.require('controllers/admin-controller');

describe('Admin', function () {

	let mockDevice = mocks.mockDevice;
	let testDevice = mockDevice;
	delete testDevice._id;

	let mockPass = mocks.mockPasses[2];
	let testPass = mockPass;
	delete testPass._id;

	let mockLog = {
		name: 'test',
		docType: 'log'
	};

	let controller;
	let app = express();
	let mockIdentifer = mocks.mockIdentifer;

	const AdminRoutes = require(path.resolve(__dirname, '../../routes/jps-middleware-admin'))(program, app);

	before(function () {
		program.db.saveAll([
			mockLog,
			mockDevice,
			testDevice,
			mockPass,
			testPass
		]).then(function (resp) {
			console.log('Saved', resp);
		});
	});

	describe('Admin Controller', function () {
		before(function () {
			controller = new AdminController(program);
		});
		it('should be defined', function (done) {
			assert(AdminController);
			done();
		});
		it('should return instance', function (done) {
			assert(controller);
			done();
		});
		it('post_passTypeIdentifier - Handles creating passTypeIdentifier', function (done) {
			assert(controller.post_passTypeIdentifier);
			done();
		});
		it('get_downloadPass - Handles download pass request', function (done) {
			assert(controller.get_downloadPass);
			done();
		});
		it('get_signPass - Handles signing a pass', function (done) {
			assert(controller.get_signPass);
			done();
		});
		it('get_find - Handles finding a pass', function (done) {
			assert(controller.get_find);
			done();
		});
	});

	describe('Admin Routes', function () {
		describe('Identifiers', function () {
			it('/api/v1/admin/identifiers - should create new pass type identifier entry', function (done) {
				request(app)
					.post(`/api/v1/admin/identifiers/${mockIdentifer.passTypeIdentifier}`)
					.field('passphrase', mockIdentifer.passphrase)
					.attach('file', mockIdentifer.p12)
					.expect('Content-Type', /json/)
					.expect(201, done);
			});

			it('/api/v1/admin/identifiers - should get pass type identifier', function (done) {
				request(app)
					.get(`/api/v1/admin/identifiers/${mockIdentifer.passTypeIdentifier}`)
					.expect('Content-Type', /json/)
					.expect(200, done);
			});

			it('/api/v1/admin/identifiers - should not get pass type identifier', function (done) {
				request(app)
					.get(`/api/v1/admin/identifiers/unknown-identifier`)
					.expect('Content-Type', /json/)
					.expect(404, done);
			});
		});

		describe('Passes', function () {
			it('POST - /api/v1/admin/passes - should create pass', function (done) {
				request(app)
					.post('/api/v1/admin/passes')
					.send({
						type: 'generic'
					})
					.expect('Content-Type', /json/)
					.expect(201, done);
			});
			it('PUT - /api/v1/admin/passes/:ID - should update pass', function (done) {
				request(app)
					.put(`/api/v1/admin/passes/${mockPass._id}`)
					.send(mockPass)
					.expect('Content-Type', /json/)
					.expect(200, done);
			});
			it('GET - /api/v1/admin/passes/:id - should return 1 pass', function (done) {
				request(app)
					.get(`/api/v1/admin/passes/${mockPass._id}`)
					.expect('Content-Type', /json/)
					.expect(200, done);
			});
		});

		describe('Finding', function () {

			it('GET - /api/v1/admin/find?docType=device - should return documents matching.', function (done) {
				request(app)
					.get('/api/v1/admin/find?docType=device')
					.expect('Content-Type', /json/)
					.expect(200, done);
			});

			xit('GET - /api/v1/admin/find?name=value - should return 404 if no match', function (done) {
				request(app)
					.get('/api/v1/admin/find?not-a-key=value')
					.expect('Content-Type', /json/)
					.expect(404, done);
			});
		});


		describe('Signing', function () {
			it(`GET - /api/v1/admin/passes/sign/:id - should sign pass _id ${mockPass._id}`, function (done) {
				request(app)
					.get(`/api/v1/admin/passes/sign/${mockPass._id}`)
					.expect('Content-Type', /json/)
					.expect(200, done);
			});
			it(`GET - /api/v1/admin/passes/sign/:id - should not sign unknown pass _id`, function (done) {
				request(app)
					.get(`/api/v1/admin/passes/sign/unknown`)
					.expect('Content-Type', /json/)
					.expect(404, done);
			});
		});
		describe('Downloading', function () {
			it(`GET - /api/v1/admin/passes/download/:id - should download pass _id ${mockPass._id}`, function (done) {
				request(app)
					.get(`/api/v1/admin/passes/download/${mockPass._id}`)
					.expect('Content-Type', /application\/vnd.apple.pkpass/)
					.expect(200, done);
			});
			it(`GET - /api/v1/admin/passes/download/:id - should not download unknown pass _id`, function (done) {
				request(app)
					.get(`/api/v1/admin/passes/download/unknown`)
					//.expect('Content-Type', /application\/vnd.apple.pkpass/)
					.expect(404, done);
			});
		});
	});
});
