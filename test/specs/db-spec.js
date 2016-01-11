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
var testPassDir = path.resolve(__dirname, '../../.tmp/');

var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;
//var program = require(path.resolve(__dirname, '../../lib/program.js'))();
var config = program.config.defaults;
var db = program.db;
var mockDevice = mocks.mockDevice;
var mockPass = mocks.mockPass;

describe('db', function () {
	it('should be defined', function (done) {
		assert(db);
		done();
	});

	it('should have allDocs, get, remove, put methods', function (done) {
		assert(db.allDocs);
		assert(db.remove);
		assert(db.put);
		assert(db.get);
		done();
	});


	it('should create file with id', function (done) {
		db.put({
			_id: 'test-file',
			name: 'test'
		}).then(function (resp) {
			assert(resp);
			done();
		});
	});
	it('should create file with generated', function (done) {
		db.post({

			name: 'test2'
		}).then(function (resp) {
			assert(resp);
			done();
		});
	});

	it('should get file with id', function (done) {
		db.get('test-file').then(function (resp) {
			assert(resp);
			done();
		});
	});

	it('should find file', function (done) {
		db.find({
			name: 'test-file'
		}).then(function (resp) {
			assert(resp);
			done();
		});
	});

	it('should remove file with id', function (done) {
		db.remove('test-file').then(function (resp) {
			assert(resp);
			done();
		});
	});

	it('should save array of docs', function (done) {
		db.saveAll([
			mockDevice, mockPass
		]).then(function (resp) {
			assert(resp);
			done();
		});
	});


});
