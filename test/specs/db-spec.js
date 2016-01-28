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
//var program = require(path.resolve(__dirname, '../../lib/program.js'))();
var config = program.config.defaults;
var db = program.db;
var mockDevice = mocks.mockDevice;
var mockPass = mocks.mockPass;


describe('db', function() {
	it('should be defined', function(done) {
		assert(db);
		done();
	});

	it('should have allDocs, get, remove, put methods', function(done) {
		assert(db.allDocs, 'should have allDocxs');
		assert(db.remove);
		assert(db.put);
		assert(db.get);
		assert(db.find, 'should have find');
		assert(db.post, 'should have post');
		assert(db.saveAll, 'should have saveAll');
		done();
	});


	it('should save array of docs', function(done) {
		db.saveAll([
			mockDevice,
			mockPass
		]).then(function(resp) {
			assert(resp);
			done();
		});
	});

	it('should create file with id', function(done) {
		db.put({
			_id: 'test-file',
			name: 'test',
			docType: 'log'
		}).then(function(resp) {
			assert(resp);
			done();
		});
	});

	it('should create doc with generated', function(done) {
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

	it('should get doc with id', function(done) {
		db.get('test-file').then(function(resp) {
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});
	xit('should remove doc with id', function(done) {
		db.remove(testId).then(function(resp) {
			assert(resp);
			done();
		}).catch(function(err) {
			assert.fail(err);
			done();
		});
	});


	it('should find device', function(done) {
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

	it('findBy() - should find object and return first match', function(done) {
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


	it('should find item by params', function(done) {
		db.find({
			serialNumber: mockPass.serialNumber
		}).then(function(resp) {
			assert(resp);
			resp.forEach(function(row) {
				assert.equal(row.serialNumber, mockPass.serialNumber, 'passes match');
			});

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


});
