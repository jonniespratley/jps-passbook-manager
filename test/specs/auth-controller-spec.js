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

	xdescribe('Routes', function() {

		it('GET - /index - should return index', function(done) {
			request(app)
				.get('/index')
				.expect('Content-Type', /html/)
				.expect(200, done);
		});

		describe('Register', function() {

			it('POST - /signup - should register user', function(done) {
				request(app)
					.post('/signup')
					.send({
						email: 'test5@gmail.com',
						password: 'test'
					})
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200, done);
			});

			it('POST - /signup - should register new user', function(done) {
				request(app)
					.post('/signup')
					.send({
						email: 'test6@gmail.com',
						password: 'test'
					})
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200, done);
			});

			it('GET - /signup - should return register form', function(done) {
				request(app)
					.get('/signup')
					.expect('Content-Type', /html/)
					.expect(200, done);
			});
		});

		describe('Account', function() {

			it('GET - /account - should return account view', function(done) {
				request(app)
					.get('/account')
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200, done);
			});

			it('GET - /me - should return json user info', function(done) {
				request(app)
					.get('/me')
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200, done);
			});

		});

		describe('Authorization', function() {

			it('GET - /login - should return login form', function(done) {
				request(app)
					.get('/login')
					.expect('Content-Type', /html/)
					.expect(200, done);
			});

			it('POST - /login - should login user', function(done) {
				request(app)
					.post('/login')
					.send({
						email: 'test@gmail.com',
						password: 'test'
					})
					.expect('Content-Type', /html/)
					.expect(200, done);
			});

			it('GET - /logout - should return logout', function(done) {
				request(app)
					.get('/logout')
					.expect(200, done);
			});

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
