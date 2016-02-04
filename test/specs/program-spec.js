'use strict';

const express = require('express');
const path = require('path');
const assert = require('assert');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;


describe('Program', function() {

	it('should be defined', function() {
		assert(program);
	});

	it('should have getLogger', function(done) {
		assert(program.getLogger);
		done();
	});

	it('should have session', function(done) {
		assert(program.get('session'));
		done();
	});

	it('should have db', function(done) {
		assert(program.get('db'));
		done();
	});

	it('mount() - should mount and return express instance', function(done) {
		assert(program.mount);
		let server = program.mount();
		assert(server);
		server.listen(4141, function(){
			done();
		});
	});

	it('register() - should register a module.', function(done) {
		assert(program.register);
		program.register('name', 'value');
		done();
	});

	it('get() - should return registered module.', function(done) {
		assert(program.get);
		assert(program.get('name') === 'value');
		done();
	});

});
