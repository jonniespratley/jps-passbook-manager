'use strict';
const path = require('path');
const _ = require('lodash');
const assert = require('assert');
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const program = mocks.program;
const User = program.get('User');

var u;

describe('User Model', function() {
	before(function() {
		u = new User({
			email: 'jonnie@test.com',
			displayName: 'jonnie',
			_json: {
				name: 'test'
			},
			_raw: ''
		});
	});

	it('should be defined', function(done) {
		assert(User);
		done();
	});

	it('should create instance', function(done) {
		assert(u);
		assert(u.username === 'jonnie');
		done();
	});

	it('should not have _json', function(done) {
		assert(u);
		assert(!u._json);
		assert(u.data);
		done();
	});

	it('should not have _raw', function(done) {
		assert(u);
		assert(!u._raw);
		done();
	});

});
