'use strict';
const express = require('express');
const path = require('path');
const request = require('supertest');
const assert = require('assert');
const Server = require(path.resolve(__dirname, '../../lib/server'));
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;
var server = null;
var serverInstance = null;

var routes = [
	path.resolve(__dirname, '../../lib/routes/admin'),
	path.resolve(__dirname, '../../lib/routes/auth')
];


describe('Server', function() {
	it('should be defined', function(done) {
		assert(Server);
		done();
	});

	it('should create instance', function(done) {
		server = new Server(program);
		assert(server);
		done();
	});

	it('mount() - should mount routes', function(done) {
		assert(server.mount);
		server.mount(routes);
		done();
	});

	it('use() - should use middleware', function(done) {
		assert(server.use);
		done();
	});

	it('listen() - should mount and return express instance', function(done) {
		//	server = program.mount();
		assert(program.mount);
		done();

		/*serverInstance = server.mount(routes).listen(4141, function () {

		 });*/
	});


	it('GET - /api - should return api', function(done) {
		request(server.app)
			.get('/api')
			.expect('Content-Type', /json/)
			.expect(function(res) {
				console.log(res);
			})
			.expect(200, done);
	});

	it('GET - /admin - should return admin', function(done) {
		request(server.app)
			.get('/admin')
			.expect('Content-Type', /json/)
			.expect(function(res) {
				console.log(res);
			})
			.expect(200, done);
	});


	it('should have program', function() {
		//
	});

});

xdescribe('Map', function() {
	var myMap = new Map();
	var keyString = "a string",
		keyObj = {
			name: 'value'
		},
		keyFunc = function() {};
	it('set - should set item', function(done) {
		myMap.set(keyString, "value associated with 'a string'");
		myMap.set(keyObj, "value associated with keyObj");
		myMap.set(keyFunc, "value associated with keyFunc");
		assert(myMap.size);
		done();
	});
	it('get - should get item', function(done) {
		assert(myMap.get(keyString) === 'a string');
		assert(myMap.get(keyObj) === keyObj);
		assert(myMap.get(keyFunc) === keyFunc);
		done();
	});
});
