var path = require('path');
var assert = require('assert');


var Passes = require(path.resolve(__dirname, '../../lib/models/passes.js'));
var p;

var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;
var config = program.config.defaults;

var mocks = require('../helpers/mocks');
describe('Passes', function() {
	it('should be defined', function(done) {
		assert(Passes);
		done();
	});

	it('getPasses() - should return all passes', function(done) {
		Passes.getPasses().then(function(resp) {
			assert.ok(resp);
			done();
		}, function(err) {
			assert.fail(err);
			done();
		});
	});

	it('add() - should add pass', function(done) {
		Passes.add(mocks.mockPass).then(function(resp) {
			assert.ok(resp);
			done();
		}, function(err) {
			assert.fail(err);
			done();
		});
	});

	it('get() - should get pass', function(done) {
		Passes.get(mocks.mockPass._id).then(function(resp) {
			assert.ok(resp);
			done();
		}, function(err) {
			assert.fail(err);
			done();
		});
	});

	xit('remove() - should remove pass', function(done) {
		Passes.remove(mocks.mockPass._id).then(function(resp) {
			assert.ok(resp);
			done();
		}, function(err) {
			assert.fail(err);
			done();
		});
	});

	it('find(params) - should resolve pass that meets params', function(done) {
		Passes.find({
			//_id: 'mock-generic'
			serialNumber: mocks.mockPass.serialNumber
		}).then(function(resp) {
			console.log(resp);
			assert.ok(resp.serialNumber === mocks.mockPass.serialNumber);
			assert.ok(resp);
			done();
		}, function(err) {
			assert.fail(err);
			done();
		});
	});

	it('find(params) - should reject promise pass that meets params', function(done) {
		Passes.find({
			//_id: 'mock-generic'
			serialNumber: 'none'
		}).then(function(resp) {
			assert.fail(resp);
			done();
		}, function(err) {
			assert.ok(err);
			done();
		});
	});

	it('findBySerial(num) - should return pass by serial number', function(done) {
		Passes.findPassBySerial(mocks.mockPass.serialNumber).then(function(resp) {
			assert.ok(resp);
			done();
		}, function(err) {
			assert.fail(err);
			done();
		});
	});

	it('remove() - should remove pass', function(done) {
		Passes.remove(mocks.mockPass._id).then(function(resp) {
			assert.ok(resp);
			done();
		}, function(err) {
			assert.fail(err);
			done();
		});
	});

});
