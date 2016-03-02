'use strict';
const express = require('express');
const path = require('path');
const request = require('supertest');
const assert = require('assert');
const Server = require(path.resolve(__dirname, '../../lib/server'));
const Plugin = require(path.resolve(__dirname, '../../lib/plugins/blog-plugin'));
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;
var server = null;
var serverInstance = null;

program.use(Plugin);

var routes = [
	path.resolve(__dirname, '../../lib/routes/admin'),
	//path.resolve(__dirname, '../../lib/routes/auth'),
	path.resolve(__dirname, '../../lib/routes/api')
];

describe('Server', function () {
	it('should be defined', function (done) {
		assert(Server);
		done();
	});

	it('should create instance', function (done) {
		server = new Server(program);
		assert(server);
		done();
	});

	it('use() - should use middleware', function (done) {
		assert(server.use);
		done();
	});

	it('mount() - should mount and return express instance', function (done) {
		serverInstance = server.mount(routes);
		assert(serverInstance);
		console.log('serverInstance', serverInstance);
		done();
	});

	it('GET - /blog - should return 200', function (done) {
		request(serverInstance)
			.get('/blog')
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(function (res) {
				console.log(res);
			})
			.expect(200, done);
	});


});
