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
var testUserEmail = `test${Date.now()}@gmail.com`;
const AuthRoutes = require(path.resolve(__dirname, '../../routes/jps-middleware-auth'))(program, app);

describe('Auth', function() {

	describe('Routes', function() {

		it('GET - /index - should return index', function(done) {
			request(app)
				.get('/index')
				.expect('Content-Type', /html/)
				.expect(200, done);
		});

		describe('Register', function() {

			it('POST - /auth/register - should register user', function(done) {
				request(app)
					.post('/auth/register')

				.send({
						email: 'test2@gmail.com',
						password: 'test'
					})
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200, done);
			});

			it('POST - /auth/register - should register new user as json', function(done) {
				request(app)
					.post('/auth/register')
					.send({
						email: testUserEmail,
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



		describe('Authorization', function() {
			beforeEach(function(done) {
				request(app).get('/logout').expect(302, done);
			});

			it('GET - /login - should return login form', function(done) {
				request(app)
					.get('/login')
					.expect('Content-Type', /html/)
					.expect(200, done);
			});

			it('POST - /login - should login user as json', function(done) {
				request(app)
					.post('/auth/login')
					.send({
						email: testUserEmail,
						password: 'test'
					})
					.set('Content-Type', 'application/json')
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200, done);
			});



			xit('GET - /logout - should return logout', function(done) {

			});

			it('POST - /auth/login - should login user', function(done) {
				request(app)
					.post('/auth/login')
					.set('Content-Type', 'application/json')
					.send({
						email: testUserEmail,
						password: 'test'
					})
					//.expect('Content-Type', /html/)
					.expect(200, done);
			});


		});
		describe('Account', function() {

			xit('GET - /account - should return account view', function(done) {
				request(app)
					.get('/account')
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200, done);
			});

			xit('GET - /me - should return json user info', function(done) {
				request(app)
					.get('/me')
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200, done);
			});

			it('GET - /me - should return html user info', function(done) {
				request(app)
					.get('/me')
					.set('Accept', 'text/html')
					.expect('Content-Type', /html/)
					.expect(200, done);
			});

			it('GET - /me - should return plain user info', function(done) {
				request(app)
					.get('/me')
					.set('Accept', 'text/plain')
					.expect('Content-Type', /plain/)
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
