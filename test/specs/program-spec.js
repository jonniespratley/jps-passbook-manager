'use strict';

const express = require('express');
const path = require('path');
const assert = require('assert');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const Program = require(path.resolve(__dirname, '../../lib/program'));
var program = mocks.program;

var routes = [
	path.resolve(__dirname, '../../lib/routes/admin'),
	path.resolve(__dirname, '../../lib/routes/auth')
];
describe('Program', function() {

	it('should be defined', function() {
		assert(Program);
	});

	it('should create instance', function() {
		assert(program);
	});

	it('should get instance', function() {
		var _program = Program.getInstance();
		assert(Program.getInstance() === _program);
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

	it('should have modules property reference', function(done) {
		assert(program.modules);
		console.log('program modules', program.modules);
		done();
	});


	it('mount() - should start server', function(done) {
		program.mount(routes);
		done();
	});


});
