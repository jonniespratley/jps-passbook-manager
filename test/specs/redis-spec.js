'use strict';

var assert = require('assert'),
	_ = require('lodash'),
	path = require('path');

const redis = require("redis-mock");
const RedisDB = require(path.resolve(__dirname, '../../lib/adapters/db-redis.js'));
const mocks = require(path.resolve(__dirname, '../helpers/mocks'));
const program = mocks.program;
const config = program.config.defaults;

let mockPass = mocks.mockPass;
let client;
let db;

describe('Adapters', function() {

	describe('redis', function() {
		before(function() {
			client = redis.createClient();
			db = new RedisDB({
				client: client
			});
		});

		it('should be have mock client', function(done) {
			assert(client);
			done();
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
