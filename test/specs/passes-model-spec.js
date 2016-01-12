var path = require('path');
var assert = require('assert');

var User = require(path.resolve(__dirname, '../../lib/models/user.js'));
var Passes = require(path.resolve(__dirname, '../../lib/models/passes.js'));
var p;
var u;
var mocks = require(path.resolve(__dirname, '../helpers/mocks'));
var program = mocks.program;
var config = program.config.defaults;

var mocks = require('../helpers/mocks');


describe('User Model', function () {
	before(function(){
		u = new User({
			id: 'test',
			displayName: 'jonnie',
			_raw: ''
		});
	});

	it('should be defined', function (done) {
		assert(User);
		done();
	});

	it('should create instance', function (done) {
		assert(u);
		assert(u.displayName === 'jonnie');
		done();
	});
	it('should not have _raw', function (done) {
		assert(u);
		assert(!u._raw);
		done();
	});

});
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

});
