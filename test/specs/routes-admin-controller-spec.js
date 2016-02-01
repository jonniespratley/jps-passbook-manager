'use strict';
const path = require('path');
const _ = require('lodash');
const assert = require('assert');
const request = require('supertest');
const express = require('express');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const program = mocks.program;
const AdminController = program.require('controllers/admin-controller');


let mockDevice = mocks.mockDevice;
let mockPass = mocks.mockPass;
let controller;
let app = express();
let mockIdentifer = {
	passTypeIdentifier: 'pass.io.passbookmanager',
	wwdr: path.resolve(__dirname, '../../certificates/wwdr-authority.pem'),
	p12: path.resolve(__dirname, '../../certificates/pass.io.passbookmanager.p12'),
	passphrase: 'fred'
};

const AdminRoutes = require(path.resolve(__dirname, '../../routes/jps-middleware-admin'))(program, app);

describe('Admin Controller', function() {
	before(function() {
		controller = new AdminController(program);
	});

	it('should be defined', function(done) {
		assert(AdminController);
		done();
	});

	it('should return instance', function(done) {
		assert(controller);
		done();
	});

  it('post_passTypeIdentifier - Handles creating passTypeIdentifier', function(done) {
		assert(controller.post_passTypeIdentifier);
		done();
	});
  it('get_downloadPass - Handles download pass request', function(done) {
		assert(controller.get_downloadPass);
		done();
	});
  it('get_signPass - Handles signing a pass', function(done) {
		assert(controller.get_signPass);
		done();
	});
  it('get_find - Handles finding a pass', function(done) {
		assert(controller.get_find);
		done();
	});
});

describe('Admin Routes', function(){

  describe('Cert Routes', function() {
    it('/api/v1/admin/passes/passTypeIdentifier - should create new pass type identifier entry', function(done) {
      request(app)
        .post('/api/v1/admin/passes/passTypeIdentifier')
        .field('passTypeIdentifier', mockIdentifer.passTypeIdentifier)
        .field('passphrase', mockIdentifer.passphrase)
        .attach('file', mockIdentifer.p12)
        .expect('Content-Type', /json/)
        .expect(200, done);
    });
  });


	it('GET - /api/v1/admin/passes - should return all passes', function(done) {
		request(app)
			.get('/api/v1/admin/passes')
			.expect('Content-Type', /json/)
			.expect(200, done);
	});

  it('GET - /api/v1/admin/passes/:id - should return 1 pass', function(done) {
    request(app)
      .get(`/api/v1/admin/passes/${mockPass._id}`)
      .expect('Content-Type', /json/)
      .expect(200, done);
  });

  xit('GET - /api/v1/register/:token - add device to db', function(done) {
    request(app)
      .get('/api/v1/admin/passes/register/' + mockDevice.token)
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



  describe('Download/Sign', function() {

    it(`GET - /api/v1/admin/passes/sign/:id - should sign pass _id ${mockPass._id}`, function(done) {
      request(app)
        .get(`/api/v1/admin/passes/sign/${mockPass._id}`)
        .expect('Content-Type', /json/)
        .expect(200, done);
    });

    it(`GET - /api/v1/admin/passes/download/:id - should download pass _id ${mockPass._id}`, function(done) {
      request(app)
        .get(`/api/v1/admin/passes/download/${mockPass._id}`)
        .expect('Content-Type', /application\/vnd.apple.pkpass/)
        .expect(200, done);
    });

  });
});
