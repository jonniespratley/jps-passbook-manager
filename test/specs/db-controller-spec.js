'use strict';
const path = require('path');
const _ = require('lodash');
const assert = require('assert');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const program = mocks.program;
const DbController = program.require('controllers/db-controller');

var controller;

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
