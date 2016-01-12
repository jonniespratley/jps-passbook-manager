'use strict';
/**
 * Created by jps on 12/17/15.
 */
var assert = require('assert'),
	path = require('path'),
	fs = require('fs-extra'),
	os = require('os');


var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;

var config = program.config.defaults;
var CouchDB = require(path.resolve(__dirname, '../../lib/adapters/db-couchdb.js'));

describe('couchdb', function() {
	var db = new CouchDB();

	var mockDevice = mocks.mockDevice;
	var mockPass = mocks.mockPass;

	it('should be defined', function(done) {
		assert(db);
		done();
	});

	it('should have allDocs, get, remove, put methods', function(done) {
		assert(db.allDocs);
		assert(db.remove);
		assert(db.put);
		assert(db.get);
		assert(db.find, 'has find');
		assert(db.post, 'has post');
		assert(db.saveAll, 'has saveall');
		done();
	});

	it('should create file with id', function(done) {
		db.put({
			_id: 'test-file',
			name: 'test'
		}).then(function(resp) {
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	it('should reject create file with used id', function(done) {
		db.put({
			_id: 'test-file',
			name: 'test'
		}).then(function(resp) {
			assert.fail(resp);
			done();
		}).catch(function(err) {
			assert.ok(err);
			done();
		});
	});

	it('should create file with generated', function(done) {
		db.post({
			name: 'test2'
		}).then(function(resp) {
			assert(resp.id, 'returns id');
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	it('should get file with id', function(done) {
		db.get('test-file').then(function(resp) {
			assert(resp);
			assert(resp.name === 'test', 'returns object');
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	it('should find object', function(done) {
		db.find({
			name: 'test'
		}).then(function(resp) {
			console.log('find res[', resp);
			assert(resp.name === 'test', 'returns object');
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	it('should remove file with id', function(done) {
		db.remove('test-file').then(function(resp) {
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	it('should save array of docs', function(done) {
		db.saveAll([
			mockDevice,
			mockPass
		]).then(function(resp) {
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});
	it('should return array of docs', function(done) {
		db.allDocs().then(function(resp) {
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	xit('should find item by params', function(done) {
		db.find({
			serialNumber: mockPass.serialNumber
		}).then(function(resp) {
			//assert(resp[0].serialNumber === mockPass.serialNumber, 'returns object');
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});



});
