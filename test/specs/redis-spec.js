'use strict';

var assert = require('assert'),
	_ = require('lodash'),
	path = require('path');

var RedisDB = require(path.resolve(__dirname, '../../lib/adapters/db-redis.js'));
var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;
var config = program.config.defaults;

var mockPass = mocks.mockPass;
var db;

describe('Adapters', function() {

	xdescribe('redis', function() {
		before(function() {
			db = new RedisDB();
		});

		it('should be defined', function(done) {
			assert(db);
			done();
		});

		it('should save object', function(done) {
			db.put(mockPass).then(function(resp) {
				assert(resp);
				done();
			});
		});

		it('should get object', function(done) {
			db.get(mockPass._id).then(function(resp) {
				assert(resp._id === mockPass._id);
				done();
			});
		});

		it('should remove object', function(done) {
			db.remove(mockPass._id).then(function(resp) {
				assert(resp);
				done();
			});
		});

		it('should get all docs', function(done) {
			db.allDocs().then(function(resp) {
				assert(resp);
				done();
			});
		});


	});

});
