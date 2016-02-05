'use strict';
const express = require('express');
const path = require('path');
const assert = require('assert');
const Server = require(path.resolve(__dirname, '../../lib/server'));
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;

var server = null;

describe('Server', function () {
	it('should be defined', function () {
		assert(Server);
	});

	it('mount() - should mount and return express instance', function (done) {
		server = program.mount();
		assert(program.mount);
		server.listen(4141, function () {
			done();
		});
	});


	it('should create instance', function () {
		server = new Server(program);
		assert(server);
		assert(server.use);
		assert(server.mount);
	});

	it('should mount routes', function () {
		assert(server.mount);
	});

	it('should have program', function () {
		//
	});

});

describe('Map', function () {
	var myMap = new Map();
	var keyString = "a string",
		keyObj = {name: 'value'},
		keyFunc = function () {
		};
	it('set - should set item', function () {
		myMap.set(keyString, "value associated with 'a string'");
		myMap.set(keyObj, "value associated with keyObj");
		myMap.set(keyFunc, "value associated with keyFunc");
		assert(myMap.size === 3);
	});
	it('get - should get item', function () {
		assert(myMap.get(keyString) === 'a string');
		assert(myMap.get(keyObj) === keyObj);
		assert(myMap.get(keyFunc) === keyFunc);
	});
});
