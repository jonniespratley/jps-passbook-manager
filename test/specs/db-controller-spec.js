'use strict';
const path = require('path');
const _ = require('lodash');
const assert = require('assert');
const request = require('supertest');
const express = require('express');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));

const program = mocks.program;
const DbController = program.get('DbController');
const config = program.get('config');

let app = express();
let controller;
let testDoc = mocks.mockPass;
delete testDoc._id;
//const DbRoutes = require(path.resolve(__dirname, '../../routes/jps-middleware-db'))

var nock = require('nock');
var scope = nock('/api/v1/db')
	.get('')
	.reply(200, {})

.get(`/unknown`)
	.reply(404, {})

//put
.put(`/unknown`)
	.query(true)
	.reply(404, {});

describe('DB Router / Controller', function() {

	describe('DB Controller', function() {
		before(function() {
			controller = new DbController(program);
		});

		it('should be defined', function(done) {
			assert(DbController);
			done();
		});

		it('should create instance', function(done) {
			assert(controller);
			done();
		});
	});

	describe('DB Routes', function() {

		it('GET - /api/v1/db - should return all docs', function(done) {
			request(app)
				.get('/api/v1/db')
				.expect('Content-Type', /json/)
				.expect(200, done);
		});

		it('POST - /api/v1/db - should create doc', function(done) {
			request(app)
				.post('/api/v1/db')
				.send(testDoc)
				.expect(function(res) {
					testDoc._id = res.body._id;
				})
				.expect('Content-Type', /json/)
				.expect(201, done);
		});

		it('PUT - /api/v1/db - should update doc and return 200', function(done) {
			testDoc.title = 'updated';
			request(app)
				.put(`/api/v1/db/${testDoc._id}`)
				.send(testDoc)
				.expect('Content-Type', /json/)
				.expect(200, done);
		});



		it('GET - /api/v1/db/:id - should get doc', function(done) {
			request(app)
				.get(`/api/v1/db/${testDoc._id}`)
				.expect(200, done);
		});

		xit('GET - /api/v1/db/:id - should return 404 if doc not found', function(done) {
			request(app)
				.get(`/api/v1/db/unknown`)
				.expect(404, done);
		});

		it('DELETE - /api/v1/db - should remove doc', function(done) {
			request(app)
				.delete(`/api/v1/db/${testDoc._id}`)
				.expect(200, done);
		});

		xit('DELETE - /api/v1/db/:id - should return 404 if doc not found', function(done) {
			request(app)
				.delete(`/api/v1/db/unknown`)
				.expect(404, done);
		});

		xit('PUT - /api/v1/db - should not update unknown doc 404', function(done) {
			delete testDoc._id;
			request(app)
				.put(`/api/v1/db/unknown`)
				.send('teat')
				.expect('Content-Type', /json/)
				.expect(404, done);
		});

	});

});
