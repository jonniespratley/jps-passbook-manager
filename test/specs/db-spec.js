'use strict';
/**
 * Created by jps on 12/17/15.
 */
var assert = require('assert'),
	path = require('path'),
	fs = require('fs-extra'),
	os = require('os');


//Test vars
var testPassName = 'Test_Pass_';
var testId = 'test-doc';
var testPassDir = path.resolve(__dirname, '../../.tmp/');

var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;
var config = program.get('config');
var db = program.get('db');

var mockDevice = mocks.mockDevice;
var mockPass = mocks.mockPass;

describe('db', function() {
	it('should be defined', function(done) {
		assert(db);
		done();
	});

	it('should have allDocs, get, remove, put methods', function(done) {
		assert(db.allDocs, 'should have allDocs');
		assert(db.remove);
		assert(db.put);
		assert(db.get);
		assert(db.find, 'should have find');
		assert(db.post, 'should have post');
		assert(db.bulkDocs, 'should have bulkDocs');
		assert(db.saveAll, 'should have saveAll');
		done();
	});

	it('bulkDocs(array) - should save array of docs', function(done) {
		db.bulkDocs([
			mockDevice,
			mockPass
		]).then(function(resp) {
			assert(resp);
			assert(resp.length === 2);
			done();
		});
	});

	it('put(obj) - should create file with id', function(done) {
		db.put({
			_id: 'test-file',
			name: 'test',
			docType: 'log'
		}).then(function(resp) {
			assert(resp);
			done();
		});
	});

	it('post(obj) - should create doc with generated', function(done) {
		db.post({
			name: 'test2',
			docType: 'log'
		}).then(function(resp) {
			testId = resp._id;
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	it('get(id) - should get doc with id and resolve promise', function(done) {
		db.get('test-file').then(function(resp) {
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	it('remove(id) - should remove doc with id and resolve promise', function(done) {
		db.remove('test-file').then(function(resp) {
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});
	it('remove(id) - should not remove doc with invalid id and reject promise', function(done) {
		db.remove('not-a-test-file').then(function(resp) {
			assert.fail(resp);
			done();
		}).catch(function(err) {
			assert(err);
			done();
		});
	});

	it('find(params) - should find params and resolve promise', function(done) {
		db.find({
			deviceLibraryIdentifier: mockDevice.deviceLibraryIdentifier
		}).then(function(resp) {
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	it('findBy(params) - should find object and return first match', function(done) {
		db.findBy({
			serialNumber: mockPass.serialNumber
		}).then(function(resp) {
			assert(resp);
			///assert(resp.name === 'test-file');
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	it('findOne(params) - should find item by params and resolve promise', function(done) {
		db.findOne({
			serialNumber: mockPass.serialNumber
		}).then(function(row) {
			assert.equal(row.serialNumber, mockPass.serialNumber, 'match');
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});

	it('findOne(params) - should not find item by non-matching params and reject promise', function(done) {
		db.findOne({
			someKey: 'someValue'
		}).then(function(row) {
			assert.fail(row);
			done();
		}).catch(function(err) {
			assert(err);
			done();
		});
	});

});
