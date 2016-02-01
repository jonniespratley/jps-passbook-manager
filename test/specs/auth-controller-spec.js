'use strict';
const path = require('path');
const _ = require('lodash');
const assert = require('assert');
const request = require('supertest');
const express = require('express');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const program = mocks.program;
const AuthController = program.require('controllers/auth-controller');
let app = express();
let controller;
const AuthRoutes = require(path.resolve(__dirname, '../../routes/jps-middleware-auth'))(program, app);



describe('Auth', function() {

	describe('Routes', function() {


		it('/login - should return login form', function(done) {
			request(app)
				.get('/login')
				.expect('Content-Type', /html/)
				.expect(200, done);
		});

		it('/logout - should return logout', function(done) {
			request(app)
				.get('/logout')
				.expect(302, done);
		});

		it('/register - should return register form', function(done) {
			request(app)
				.get('/register')
				.expect('Content-Type', /html/)
				.expect(200, done);
		});

	});

	describe('Auth Controller', function() {
		before(function() {
			controller = new AuthController(program);
		});

		it('should be defined', function(done) {
			assert(AuthController);
			done();
		});

		it('should create instance', function(done) {
			assert(controller);
			done();
		});

	});
});
